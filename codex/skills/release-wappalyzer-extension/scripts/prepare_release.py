#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shlex
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_REPO = Path.home() / "Sites" / "wappalyzer" / "extension"
PREPARATION_FILE_NAME = ".release-preparation.json"
SEMVER_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)$")
DETECTION_SUBJECT_RE = re.compile(r"^(add|update|fix)\b", re.IGNORECASE)
TECHNOLOGY_PATH_PREFIX = "src/technologies/"


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
        description="Inspect, prepare, or release the Wappalyzer extension."
    )
    parser.add_argument(
        "mode",
        choices=("inspect", "prepare", "release"),
        help="Required safety mode. Only release may commit, tag, or push.",
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


def get_tracked_status(repo: Path, commands_run: list[str]) -> str:
    return run(
        ["git", "status", "--short", "--untracked-files=no"],
        repo,
        capture=True,
        commands_run=commands_run,
    )


def ensure_clean_tracked(repo: Path, commands_run: list[str]) -> None:
    status = get_tracked_status(repo, commands_run)

    if status:
        raise RuntimeError(
            "Tracked files are dirty before sync. Commit or discard them first."
        )


def get_head(repo: Path, commands_run: list[str]) -> str:
    return run(
        ["git", "rev-parse", "HEAD"],
        repo,
        capture=True,
        commands_run=commands_run,
    )


def get_origin_counts(repo: Path, commands_run: list[str]) -> tuple[int, int]:
    counts = run(
        ["git", "rev-list", "--left-right", "--count", "HEAD...origin/master"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    ahead_text, behind_text = counts.split()
    return int(ahead_text), int(behind_text)


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


def sync_for_preparation(repo: Path, commands_run: list[str]) -> list[str]:
    actions: list[str] = []

    run(
        ["git", "fetch", "origin", "master", "--tags"],
        repo,
        commands_run=commands_run,
    )

    ahead, behind = get_origin_counts(repo, commands_run)

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
        actions.append("local master is ahead; push deferred")
    else:
        actions.append("already up to date")

    return actions


def refresh_origin_for_release(repo: Path, commands_run: list[str]) -> None:
    run(
        ["git", "fetch", "origin", "master", "--tags"],
        repo,
        commands_run=commands_run,
    )
    ahead, behind = get_origin_counts(repo, commands_run)

    if ahead and behind:
        raise RuntimeError("Local master and origin/master have diverged.")

    if behind:
        raise RuntimeError(
            "origin/master advanced after preparation. Revert or finish the prepared "
            "state, then prepare again from the updated branch."
        )


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
        run(["git", "add", "-u"], repo, commands_run=commands_run)
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


def get_detection_commit_subjects(
    repo: Path,
    previous_build: str | None,
    commands_run: list[str],
) -> list[tuple[str, str]]:
    log_range = f"{previous_build}..HEAD" if previous_build else "HEAD"
    rows = run(
        ["git", "log", "--no-merges", "--format=%H%x09%s", log_range],
        repo,
        capture=True,
        commands_run=commands_run,
    ).splitlines()

    commit_subjects: list[tuple[str, str]] = []

    for row in rows:
        if "\t" not in row:
            continue

        commit, subject = row.split("\t", 1)

        if DETECTION_SUBJECT_RE.match(subject.strip()):
            commit_subjects.append((commit, subject))

    return commit_subjects


def get_commit_parent(
    repo: Path,
    commit: str,
    commands_run: list[str],
) -> str:
    return run(
        ["git", "rev-parse", f"{commit}^"],
        repo,
        capture=True,
        commands_run=commands_run,
    )


def get_changed_technology_paths_for_commit(
    repo: Path,
    commit: str,
    commands_run: list[str],
) -> list[str]:
    changed_paths = run(
        ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", commit, "--", "src/technologies"],
        repo,
        capture=True,
        commands_run=commands_run,
    ).splitlines()

    return [
        path
        for path in changed_paths
        if path.startswith(TECHNOLOGY_PATH_PREFIX) and path.endswith(".json")
    ]


def load_json_at_revision(
    repo: Path,
    revision: str,
    relative_path: str,
    commands_run: list[str],
) -> dict:
    return json.loads(
        run(
            ["git", "show", f"{revision}:{relative_path}"],
            repo,
            capture=True,
            commands_run=commands_run,
        )
    )


def build_changelog_lines(
    repo: Path,
    previous_build: str | None,
    commands_run: list[str],
) -> list[str]:
    entries: list[dict[str, str]] = []
    entry_indexes: dict[str, int] = {}

    for commit, _subject in get_detection_commit_subjects(repo, previous_build, commands_run):
        parent = get_commit_parent(repo, commit, commands_run)

        for relative_path in get_changed_technology_paths_for_commit(repo, commit, commands_run):
            previous_data = load_json_at_revision(repo, parent, relative_path, commands_run)
            current_data = load_json_at_revision(repo, commit, relative_path, commands_run)

            for technology_name, current_definition in current_data.items():
                if technology_name not in previous_data:
                    label = "ADD"
                elif previous_data[technology_name] != current_definition:
                    label = "FIX"
                else:
                    continue

                key = technology_name.casefold()
                existing_index = entry_indexes.get(key)

                if existing_index is None:
                    entry_indexes[key] = len(entries)
                    entries.append({"label": label, "name": technology_name})
                    continue

                if label == "ADD" and entries[existing_index]["label"] != "ADD":
                    entries[existing_index] = {"label": label, "name": technology_name}

    return [f"* `{entry['label']}` {entry['name']} detection" for entry in entries]


def ensure_artifacts_exist(paths: list[Path]) -> None:
    missing = [str(path) for path in paths if not path.exists()]

    if missing:
        raise RuntimeError(
            f"Expected release artifact(s) were not created: {', '.join(missing)}."
        )


def hash_artifact(path: Path) -> str:
    if not path.exists():
        raise RuntimeError(f"Release artifact is missing: {path}.")

    digest = hashlib.sha256()

    if path.is_file():
        paths = [path]
        root = path.parent
    elif path.is_dir():
        paths = sorted(item for item in path.rglob("*") if item.is_file())
        root = path
    else:
        raise RuntimeError(f"Unsupported release artifact type: {path}.")

    for item in paths:
        relative_name = item.relative_to(root).as_posix()
        digest.update(relative_name.encode())
        digest.update(b"\0")

        with item.open("rb") as artifact_file:
            for chunk in iter(lambda: artifact_file.read(1024 * 1024), b""):
                digest.update(chunk)

        digest.update(b"\0")

    return digest.hexdigest()


def artifact_hashes(repo: Path, paths: list[Path]) -> dict[str, str]:
    repo = repo.resolve()
    hashes: dict[str, str] = {}

    for path in paths:
        resolved = path.resolve()

        try:
            relative_path = resolved.relative_to(repo).as_posix()
        except ValueError as error:
            raise RuntimeError(f"Release artifact escapes the repository: {path}.") from error

        hashes[relative_path] = hash_artifact(resolved)

    return dict(sorted(hashes.items()))


def find_safari_outputs(build_dir: Path) -> list[str]:
    return sorted(str(path) for path in build_dir.rglob("*.xcodeproj"))


def get_preparation_path(repo: Path) -> Path:
    return repo / "build" / PREPARATION_FILE_NAME


def get_tracked_diff_digest(repo: Path, commands_run: list[str]) -> str:
    diff = run(
        ["git", "diff", "--binary", "--no-ext-diff"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    return hashlib.sha256(diff.encode()).hexdigest()


def write_preparation_record(
    *,
    repo: Path,
    version: str,
    base_commit: str,
    diff_digest: str,
    safari_requested: bool,
    safari_outputs: list[str],
    changelog_lines: list[str],
    artifact_digests: dict[str, str],
) -> Path:
    path = get_preparation_path(repo)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "baseCommit": base_commit,
                "artifactSha256": artifact_digests,
                "changelogLines": changelog_lines,
                "diffSha256": diff_digest,
                "safariOutputs": safari_outputs,
                "safariRequested": safari_requested,
                "version": version,
            },
            indent=2,
        )
        + "\n"
    )
    return path


def load_preparation_record(repo: Path) -> dict | None:
    path = get_preparation_path(repo)

    if not path.exists():
        return None

    try:
        return json.loads(path.read_text())
    except (json.JSONDecodeError, OSError) as error:
        raise RuntimeError(f"Invalid preparation record at {path}: {error}") from error


def preparation_artifacts(repo: Path, version: str) -> tuple[Path, Path, Path]:
    build_dir = repo / "build"
    return (
        build_dir / "webextension-v3.zip",
        build_dir / "webextension-edge.zip",
        build_dir / f"changelog-v{version}.md",
    )


def validate_preparation(
    repo: Path,
    record: dict,
    requested_version: str | None,
    safari_requested: bool,
    commands_run: list[str],
) -> dict:
    ensure_branch(repo, commands_run)
    version = normalize_version(str(record.get("version", "")))

    if requested_version and normalize_version(requested_version) != version:
        raise RuntimeError(
            f"Prepared version is {version}, not requested version {requested_version}."
        )

    if safari_requested and not record.get("safariRequested"):
        raise RuntimeError("Prepared state does not include the requested Safari build.")

    if get_head(repo, commands_run) != record.get("baseCommit"):
        raise RuntimeError("Prepared state was created from a different HEAD commit.")

    manifest = load_manifest(repo / "src" / "manifest.json")
    if normalize_version(str(manifest.get("version", ""))) != version:
        raise RuntimeError("Prepared manifest version no longer matches its record.")

    if get_tracked_diff_digest(repo, commands_run) != record.get("diffSha256"):
        raise RuntimeError("Tracked changes no longer match the prepared release state.")

    webextension_v3_path, webextension_edge_path, changelog_path = (
        preparation_artifacts(repo, version)
    )
    ensure_artifacts_exist(
        [webextension_v3_path, webextension_edge_path, changelog_path]
    )
    artifact_paths = [
        webextension_v3_path,
        webextension_edge_path,
        changelog_path,
        *(Path(path) for path in record.get("safariOutputs") or []),
    ]
    recorded_hashes = record.get("artifactSha256")

    if not isinstance(recorded_hashes, dict) or not recorded_hashes:
        raise RuntimeError("Prepared state predates artifact integrity hashes; prepare again.")

    if artifact_hashes(repo, artifact_paths) != recorded_hashes:
        raise RuntimeError("Release artifacts no longer match the prepared release state.")

    return {
        "base_commit": record["baseCommit"],
        "changelog_lines": list(record.get("changelogLines") or []),
        "changelog_path": changelog_path,
        "preparation_path": get_preparation_path(repo),
        "safari_outputs": list(record.get("safariOutputs") or []),
        "safari_requested": bool(record.get("safariRequested")),
        "sync_actions": ["using validated prepared state"],
        "version": version,
        "webextension_edge_path": webextension_edge_path,
        "webextension_v3_path": webextension_v3_path,
    }


def prepare_release(
    repo: Path,
    requested_version: str | None,
    safari_requested: bool,
    commands_run: list[str],
) -> dict:
    ensure_clean_tracked(repo, commands_run)
    ensure_branch(repo, commands_run)
    sync_actions = sync_for_preparation(repo, commands_run)
    ensure_clean_tracked(repo, commands_run)

    manifest_path = repo / "src" / "manifest.json"
    manifest = load_manifest(manifest_path)
    current_version = normalize_version(str(manifest.get("version", "")).strip())
    version = (
        normalize_version(requested_version)
        if requested_version
        else bump_patch(current_version)
    )

    ensure_tag_available(repo, version, commands_run)
    previous_build = get_latest_build_commit(repo, commands_run)
    base_commit = get_head(repo, commands_run)

    manifest["version"] = version
    write_manifest(manifest_path, manifest)
    run(["yarn", "build:release"], repo, commands_run=commands_run)

    webextension_v3_path, webextension_edge_path, changelog_path = (
        preparation_artifacts(repo, version)
    )
    ensure_artifacts_exist([webextension_v3_path, webextension_edge_path])

    safari_outputs: list[str] = []
    if safari_requested:
        if not shutil.which("xcrun"):
            raise RuntimeError("Safari was requested but xcrun is not available.")
        run(["yarn", "build:safari"], repo, commands_run=commands_run)
        safari_outputs = find_safari_outputs(repo / "build")

    changelog_lines = build_changelog_lines(repo, previous_build, commands_run)
    changelog_path.write_text(
        ("\n".join(changelog_lines) + "\n") if changelog_lines else ""
    )
    artifact_paths = [
        webextension_v3_path,
        webextension_edge_path,
        changelog_path,
        *(Path(path) for path in safari_outputs),
    ]
    preparation_path = write_preparation_record(
        repo=repo,
        version=version,
        base_commit=base_commit,
        diff_digest=get_tracked_diff_digest(repo, commands_run),
        safari_requested=safari_requested,
        safari_outputs=safari_outputs,
        changelog_lines=changelog_lines,
        artifact_digests=artifact_hashes(repo, artifact_paths),
    )

    return {
        "base_commit": base_commit,
        "changelog_lines": changelog_lines,
        "changelog_path": changelog_path,
        "preparation_path": preparation_path,
        "safari_outputs": safari_outputs,
        "safari_requested": safari_requested,
        "sync_actions": sync_actions,
        "version": version,
        "webextension_edge_path": webextension_edge_path,
        "webextension_v3_path": webextension_v3_path,
    }


def inspect_release(repo: Path, commands_run: list[str]) -> None:
    branch = run(
        ["git", "branch", "--show-current"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    upstream = run(
        ["git", "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
        repo,
        capture=True,
        commands_run=commands_run,
    )
    ahead, behind = get_origin_counts(repo, commands_run)
    manifest = load_manifest(repo / "src" / "manifest.json")
    version = normalize_version(str(manifest.get("version", "")).strip())
    latest_build = get_latest_build_commit(repo, commands_run)
    status = get_tracked_status(repo, commands_run)
    preparation = load_preparation_record(repo)

    print("Inspection summary")
    print(f"Repo: {repo}")
    print(f"Branch: {branch}")
    print(f"Upstream: {upstream}")
    print(f"Ahead/behind cached origin/master: {ahead}/{behind}")
    print(f"Current manifest version: {version}")
    print(f"Default next version: {bump_patch(version)}")
    print(f"Latest Build marker: {latest_build or 'none'}")
    print(f"Tracked status: {status or 'clean'}")
    if preparation:
        print(
            "Prepared state: "
            f"v{preparation.get('version', 'unknown')} from "
            f"{preparation.get('baseCommit', 'unknown')}"
        )
    else:
        print("Prepared state: none")
    print("Remote refs were not fetched; inspect mode is read-only.")


def get_or_create_preparation(
    repo: Path,
    requested_version: str | None,
    safari_requested: bool,
    commands_run: list[str],
) -> dict:
    record = load_preparation_record(repo)

    if record and record.get("baseCommit") == get_head(repo, commands_run):
        return validate_preparation(
            repo,
            record,
            requested_version,
            safari_requested,
            commands_run,
        )

    if get_tracked_status(repo, commands_run):
        raise RuntimeError(
            "Tracked files are dirty and do not match a prepared release state."
        )

    if record:
        get_preparation_path(repo).unlink(missing_ok=True)

    return prepare_release(
        repo,
        requested_version,
        safari_requested,
        commands_run,
    )


def publish_release(repo: Path, preparation: dict, commands_run: list[str]) -> str:
    version = preparation["version"]
    refresh_origin_for_release(repo, commands_run)
    ensure_tag_available(repo, version, commands_run)
    release_commit = commit_release(repo, version, commands_run)
    run(["git", "tag", f"v{version}"], repo, commands_run=commands_run)
    run(
        ["git", "push", "--atomic", "origin", "master", f"refs/tags/v{version}"],
        repo,
        commands_run=commands_run,
    )
    preparation["preparation_path"].unlink(missing_ok=True)
    return release_commit


def print_summary(
    *,
    mode: str,
    repo: Path,
    preparation: dict,
    commands_run: list[str],
    release_commit: str | None = None,
) -> None:
    version = preparation["version"]
    print("")
    print(f"{mode.capitalize()} summary")
    print(f"Repo: {repo}")
    print(f"Version: {version}")
    print(f"Sync: {', '.join(preparation['sync_actions'])}")
    print(f"Local manifest: {repo / 'src/manifest.json'}")
    print(f"Chrome/Firefox artifact: {preparation['webextension_v3_path']}")
    print(f"Edge artifact: {preparation['webextension_edge_path']}")
    print(f"Changelog: {preparation['changelog_path']}")
    if release_commit:
        print(f"Commit: {release_commit}")
        print(f"Tag: v{version}")
        print("Push: origin/master and tag pushed atomically")
    else:
        print("Commit/tag/push: not performed")
        print(f"Preparation record: {preparation['preparation_path']}")
    if preparation["safari_requested"] and preparation["safari_outputs"]:
        safari_status = ", ".join(preparation["safari_outputs"])
    elif preparation["safari_requested"]:
        safari_status = "requested, but no .xcodeproj path was found under build/"
    else:
        safari_status = "not requested"
    print(f"Safari: {safari_status}")
    print("Commands:")
    for command in commands_run:
        print(f"- {command}")
    print("Changelog entries:")
    if preparation["changelog_lines"]:
        for line in preparation["changelog_lines"]:
            print(line)
    else:
        print("- none")


def main() -> int:
    args = parse_args()
    repo = Path(args.repo).resolve()
    commands_run: list[str] = []

    try:
        require_repo(repo)

        if args.mode == "inspect":
            if args.version or args.safari:
                raise RuntimeError("inspect mode does not accept --version or --safari.")
            inspect_release(repo, commands_run)
            return 0

        if args.mode == "prepare":
            preparation = prepare_release(
                repo,
                args.version,
                args.safari,
                commands_run,
            )
            print_summary(
                mode="prepare",
                repo=repo,
                preparation=preparation,
                commands_run=commands_run,
            )
            return 0

        preparation = get_or_create_preparation(
            repo,
            args.version,
            args.safari,
            commands_run,
        )
        release_commit = publish_release(repo, preparation, commands_run)
        print_summary(
            mode="release",
            repo=repo,
            preparation=preparation,
            commands_run=commands_run,
            release_commit=release_commit,
        )
        return 0
    except RuntimeError as error:
        return fail(str(error))


if __name__ == "__main__":
    sys.exit(main())
