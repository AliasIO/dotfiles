---
name: release-wappalyzer-extension
description: Inspect release readiness, prepare local browser-extension artifacts, or explicitly release the Wappalyzer extension from the local extension repository. Use for version and Git-state inspection, local release builds and changelogs that must not commit or push, or an explicit release that may create a Build commit, tag, and atomic push. Browser-store upload is always excluded.
---

# Release Wappalyzer Extension

Choose one mode from the user's intent. If release authority is ambiguous, use `inspect`; never promote `prepare` to `release`.

Read [references/release-workflow.md](./references/release-workflow.md) before `prepare` or `release`. Use the bundled helper rather than retyping the workflow.

## Inspect

Inspect local repository state, cached ahead/behind counts, current and next version, latest release marker, and any prepared state. Make no filesystem, Git-ref, or remote changes.

```bash
python3 "$HOME/Projects/dotfiles/codex/skills/release-wappalyzer-extension/scripts/prepare_release.py" inspect
```

## Prepare

Prepare local artifacts only. The helper may fetch and fast-forward local `master`, update the manifest, run builds, and write a changelog and preparation record. It never commits, tags, or pushes in this mode.

```bash
python3 "$HOME/Projects/dotfiles/codex/skills/release-wappalyzer-extension/scripts/prepare_release.py" prepare
```

Add `--version x.y.z` only for an explicit version and `--safari` only when Safari was requested.

## Release

Use only when the user explicitly requests release/publication of the Git release. The helper validates or creates a prepared state, creates `Build vX.Y.Z`, tags `vX.Y.Z`, and atomically pushes `master` and the tag. It never uploads to a browser store.

```bash
python3 "$HOME/Projects/dotfiles/codex/skills/release-wappalyzer-extension/scripts/prepare_release.py" release
```

## Invariants

- Use `$HOME/Projects/wappalyzer/extension`, branch `master`, upstream `origin/master`.
- Treat `src/manifest.json` as the canonical version source and default to a patch bump.
- Use `yarn build:release`; do not substitute fast or manual build paths.
- Build Safari only when explicitly requested; stop if `xcrun` is unavailable.
- Stop on unrecognized tracked changes or divergent Git history; never auto-stash.
- Use `build/webextension-v3.zip` for Chrome/Firefox and `build/webextension-edge.zip` for Edge.
- Keep Chrome Web Store, AMO, Edge Add-ons, and Safari store upload outside this skill.

Report the mode, version, sync action, commands, artifact and changelog paths, Safari status, and whether commit/tag/push occurred.
