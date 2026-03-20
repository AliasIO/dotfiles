#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
import shlex
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_REPO = Path("/Users/elbert/Sites/wappalyzer/extension")
SEMVER_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")


def shell_join(parts: list[str]) -> str:
    return " ".join(shlex.quote(part) for part in parts)


def fail(message: str) -> int:
    print(f"ERROR: {message}", file=sys.stderr)
    return 1


def run(
    cmd: list[str],
    cwd: Path,
    *,
    capture: bool = False,
    commands_run: list[str] | None = None,
) -> str:
    command = shell_join(cmd)
    print(f"+ {command}")

    if commands_run is not None:
        commands_run.append(command)

    result = subprocess.run(
        cmd,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.PIPE if capture else None,
        check=False,
    )

    if result.returncode != 0:
        if capture:
            if result.stdout:
                print(result.stdout, end="")
            if result.stderr:
                print(result.stderr, end="", file=sys.stderr)
        raise RuntimeError(f"Command failed: {command}")

    return result.stdout.strip() if capture else ""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Prepare a Wappalyzer extension release."
    )
    parser.add_argument(
        "--repo",
        default=str(DEFAULT_REPO),
        help="Path to the extension repo",
    )
    parser.add_argument(
        "--version",
        help="Explicit x.y.z release version. Defaults to a patch bump.",
    )
    parser.add_argument(
        "--safari",
        action="store_true",
        help="Build Safari artifacts too.",
    )
    return parser.parse_args()


def require_repo(repo: Path) -> None:
    if not repo.exists():
        raise RuntimeError(f"Repo path does not exist: {repo}")
    if not (repo / ".git").exists():
        raise RuntimeError(f"Repo path is not a Git checkout: {repo}")


def ensure_clean_tracked(repo: Path, commands_run: list[str]) -> None:
    status = run(
        ["git", "status", "--short", "--untracked-files=no"],
        repo,
        capture=True,
        commands_run=commands_run,
    )

    if status:
        raise RuntimeError(
            "Tracked files are dirty before sync. Commit or discard them first."
        )


def ensure_branch(repo: Path, commands_run: list[str]) -> None:
    branch = run(
        ["git", "branch", "--show-current"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    if branch != "master":
        raise RuntimeError(f"Expected branch master, found {branch}.")

    upstream = run(
        ["git", "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    if upstream != "origin/master":
        raise RuntimeError(f"Expected upstream origin/master, found {upstream}.")


def sync_origin(repo: Path, commands_run: list[str]) -> list[str]:
    actions: list[str] = []

    run(
        ["git", "fetch", "origin", "master", "--tags"],
        repo,
        commands_run=commands_run,
    )

    counts = run(
        ["git", "rev-list", "--left-right", "--count", "HEAD...origin/master"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    ahead_text, behind_text = counts.split()
    ahead = int(ahead_text)
    behind = int(behind_text)

    if ahead and behind:
        raise RuntimeError("Local master and origin/master have diverged.")

    if behind:
        run(
            ["git", "pull", "--ff-only", "origin", "master"],
            repo,
            commands_run=commands_run,
        )
        actions.append("pulled origin/master")
    elif ahead:
        run(
            ["git", "push", "origin", "master"],
            repo,
            commands_run=commands_run,
        )
        actions.append("pushed local master")
    else:
        actions.append("already up to date")

    return actions


def load_manifest(manifest_path: Path) -> dict:
    return json.loads(manifest_path.read_text())


def write_manifest(manifest_path: Path, manifest: dict) -> None:
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")


def normalize_version(version: str) -> str:
    if not SEMVER_RE.fullmatch(version):
        raise RuntimeError(f"Version must be x.y.z, got {version}.")
    return version


def bump_patch(version: str) -> str:
    match = SEMVER_RE.fullmatch(version)
    if not match:
        raise RuntimeError(f"Current manifest version is not x.y.z: {version}.")

    major, minor, patch = (int(value) for value in match.groups())

    return f"{major}.{minor}.{patch + 1}"


def get_latest_build_commit(repo: Path, commands_run: list[str]) -> str | None:
    commit = run(
        ["git", "log", "--format=%H", "--grep=^Build v", "-n", "1"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    return commit or None


def ensure_tag_available(repo: Path, version: str, commands_run: list[str]) -> None:
    tag_name = f"refs/tags/v{version}"
    result = subprocess.run(
        ["git", "rev-parse", "--verify", "-q", tag_name],
        cwd=repo,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    commands_run.append(shell_join(["git", "rev-parse", "--verify", "-q", tag_name]))

    if result.returncode == 0:
        raise RuntimeError(f"Tag v{version} already exists.")


def commit_release(repo: Path, version: str, commands_run: list[str]) -> str:
    tracked_status = run(
        ["git", "status", "--short", "--untracked-files=no"],
        repo,
        capture=True,
        commands_run=commands_run,
    )

    if tracked_status:
        run(["git", "add", "-A"], repo, commands_run=commands_run)
        run(
            ["git", "commit", "-m", f"Build v{version}"],
            repo,
            commands_run=commands_run,
        )
    else:
        run(
            ["git", "commit", "--allow-empty", "-m", f"Build v{version}"],
            repo,
            commands_run=commands_run,
        )

    return run(
        ["git", "rev-parse", "HEAD"],
        repo,
        capture=True,
        commands_run=commands_run,
    )


def normalize_detection_subject(subject: str) -> str | None:
    subject = subject.strip()
    if not subject:
        return None

    if subject.startswith("Add "):
        label = "ADD"
        name = subject[4:]
    elif subject.startswith("Update "):
        label = "FIX"
        name = subject[7:]
    elif subject.startswith("Fix "):
        label = "FIX"
        name = subject[4:]
    else:
        return None

    name = re.sub(r"\s*/\s*.+$", "", name).strip()

    if not name:
        return None

    return f"* `{label}` {name} detection"


def build_changelog_lines(
    repo: Path,
    previous_build: str | None,
    commands_run: list[str],
) -> list[str]:
    log_range = f"{previous_build}..HEAD" if previous_build else "HEAD"
    subjects = run(
        ["git", "log", "--no-merges", "--format=%s", log_range],
        repo,
        capture=True,
        commands_run=commands_run,
    ).splitlines()

    lines: list[str] = []
    seen: set[str] = set()

    for subject in subjects:
        line = normalize_detection_subject(subject)

        if line and line not in seen:
            seen.add(line)
            lines.append(line)

    return lines


def find_safari_outputs(build_dir: Path) -> list[str]:
    return sorted(str(path) for path in build_dir.rglob("*.xcodeproj"))


def print_summary(
    *,
    repo: Path,
    version: str,
    sync_actions: list[str],
    commands_run: list[str],
    release_commit: str,
    changelog_path: Path,
    changelog_lines: list[str],
    safari_requested: bool,
    safari_outputs: list[str],
) -> None:
    print("")
    print("Release summary")
    print(f"Repo: {repo}")
    print(f"Version: {version}")
    print(f"Sync: {', '.join(sync_actions)}")
    print(f"Local manifest: {repo / 'src/manifest.json'}")
    print(f"Artifact: {repo / 'build/webextension-v3.zip'}")
    print(f"Changelog: {changelog_path}")
    print(f"Commit: {release_commit}")
    print(f"Tag: v{version}")
    if safari_requested and safari_outputs:
        safari_status = ", ".join(safari_outputs)
    elif safari_requested:
        safari_status = "requested, but no .xcodeproj path was found under build/"
    else:
        safari_status = "not requested"
    print(f"Safari: {safari_status}")
    print("Commands:")
    for command in commands_run:
        print(f"- {command}")
    print("Changelog entries:")
    if changelog_lines:
        for line in changelog_lines:
            print(line)
    else:
        print("- none")


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).resolve()
    commands_run: list[str] = []

    try:
        require_repo(repo)
        ensure_clean_tracked(repo, commands_run)
        ensure_branch(repo, commands_run)
        sync_actions = sync_origin(repo, commands_run)

        manifest_path = repo / "src/manifest.json"
        manifest = load_manifest(manifest_path)
        current_version = normalize_version(str(manifest.get("version", "")).strip())
        version = normalize_version(args.version) if args.version else bump_patch(current_version)

        ensure_tag_available(repo, version, commands_run)
        previous_build = get_latest_build_commit(repo, commands_run)

        manifest["version"] = version
        write_manifest(manifest_path, manifest)

        run(["yarn", "build:release"], repo, commands_run=commands_run)

        safari_outputs: list[str] = []
        if args.safari:
            if not shutil.which("xcrun"):
                raise RuntimeError("Safari was requested but xcrun is not available.")
            run(["yarn", "build:safari"], repo, commands_run=commands_run)
            safari_outputs = find_safari_outputs(repo / "build")

        release_commit = commit_release(repo, version, commands_run)
        run(["git", "tag", f"v{version}"], repo, commands_run=commands_run)

        changelog_lines = build_changelog_lines(repo, previous_build, commands_run)
        changelog_path = repo / "build" / f"changelog-v{version}.md"
        changelog_path.write_text(
            ("\n".join(changelog_lines) + "\n") if changelog_lines else ""
        )

        run(
            ["git", "push", "--atomic", "origin", "master", f"refs/tags/v{version}"],
            repo,
            commands_run=commands_run,
        )

        print_summary(
            repo=repo,
            version=version,
            sync_actions=sync_actions,
            commands_run=commands_run,
            release_commit=release_commit,
            changelog_path=changelog_path,
            changelog_lines=changelog_lines,
            safari_requested=args.safari,
            safari_outputs=safari_outputs,
        )
        return 0
    except RuntimeError as error:
        return fail(str(error))


if __name__ == "__main__":
    sys.exit(main())
