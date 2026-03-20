---
name: release-wappalyzer-extension
description: Prepare a Wappalyzer browser-extension release from `/Users/elbert/Sites/wappalyzer/extension`. Use when Codex needs to sync the extension repo with `origin/master`, bump or set the release version in the local `src/manifest.json`, run the default release build with prettify, optionally build Safari, create a `Build vX.X.X` commit and matching tag, and generate the extension changelog for manual store handoff.
---

# Release Wappalyzer Extension

Use this skill for end-to-end extension release preparation in the current Wappalyzer workspace. It prepares the release artifacts and Git markers, but it does not publish to browser stores.

Read [references/release-workflow.md](./references/release-workflow.md) before changing the workflow. Use `scripts/prepare_release.py` as the default entrypoint instead of retyping the release sequence.

## Workflow

1. Work in `/Users/elbert/Sites/wappalyzer/extension`.
2. Run the helper script:

```bash
python3 /Users/elbert/Sites/dotfiles/codex/skills/release-wappalyzer-extension/scripts/prepare_release.py
```

3. Add flags only when the user asks for them:

```bash
python3 /Users/elbert/Sites/dotfiles/codex/skills/release-wappalyzer-extension/scripts/prepare_release.py --version 6.11.1
python3 /Users/elbert/Sites/dotfiles/codex/skills/release-wappalyzer-extension/scripts/prepare_release.py --safari
```

4. Report the result with:
   - release version
   - sync action taken against `origin/master`
   - commands run
   - artifact paths for Chrome/Firefox and Edge
   - commit hash and tag
   - Safari status
   - changelog path and entries

## Defaults

- Read the current version from `src/manifest.json`.
- If no version is supplied, patch-bump it by one segment, for example `6.11.0` to `6.11.1`.
- Run `yarn build:release` by default. This is the required path because it includes `prettify`.
- Exclude Safari unless the user explicitly requests it.
- Stop if tracked files are dirty before sync. Do not auto-stash.
- Stop if the repo is not on `master` tracking `origin/master`.
- Create `Build vX.X.X` and tag `vX.X.X` even when the build produces no tracked diff by using an empty commit.

## Guardrails

- Treat `src/manifest.json` as the current release-version source.
- Do not switch to `yarn build`, `yarn build:fast`, or a manual build sequence unless the user explicitly changes the release policy.
- Do not publish to Chrome Web Store, AMO, or Safari from this skill.
- Generate the changelog from commits since the previous `Build v...` marker, following the formatting rule in `AGENTS.md`.
- If Safari was requested and `xcrun` is unavailable, stop and report the blocker instead of silently skipping it.
