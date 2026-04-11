# Release Workflow

## Repo

- Repo: `/Users/elbert/Sites/wappalyzer/extension`
- Branch: `master`
- Upstream: `origin/master`

## Versioning

- Treat `src/manifest.json` as the single canonical Manifest V3 source for Chromium, Firefox, and Safari conversion.
- Read the current version from `src/manifest.json`.
- If no version is provided, patch-bump the current version by one.
- Require numeric `x.y.z` versions.
- Keep the bumped version in tracked `src/manifest.json` after the build so it lands in the release commit when it changes.

## Build Commands

Default release build:

```bash
yarn build:release
```

Optional Safari build:

```bash
yarn build:safari
```

Do not use `yarn build` or `yarn build:fast` for the default release path.

Keep the canonical `src/manifest.json` background block compatible with Chrome and Firefox. For Microsoft Edge uploads, use `build/webextension-edge.zip` because its packaged manifest omits `background.scripts`.

## Sync Rules

- Fetch only `origin master` and tags before comparing ahead/behind counts.
- If tracked files are dirty before sync, stop and ask the user.
- If `master` is behind `origin/master`, pull with `--ff-only`.
- If `master` is ahead of `origin/master`, push it before starting the release.
- If local and remote histories diverge, stop and ask the user.

## Git Markers

- Commit the release as `Build vX.X.X`.
- Tag the release commit as `vX.X.X`.
- If the build creates no tracked diff, still create the release marker with `git commit --allow-empty`.
- Push the branch and tag together.

## Changelog

Generate the changelog from the previous `Build v...` commit to the new release commit.

For standalone changelog requests outside an in-progress release, compare the latest two `Build v...` commits and ignore newer HEAD commits.

Rules:
- scan non-merge commits between the previous release marker and the new release whose subjects begin with `add`, `update`, or `fix`, matched case-insensitively
- derive affected technologies from each matching commit's `src/technologies/*.json` diff
- emit `ADD` when a technology key is new in that commit
- emit `FIX` when an existing technology key changed in that commit
- ignore removed technologies and non-technology changes
- format each line exactly as `* \`ADD\` Name detection` or `* \`FIX\` Name detection`

Example:

```text
* `ADD` Audienceful detection
* `FIX` Firebase detection
```

Write the changelog to `build/changelog-vX.X.X.md`.

## Expected Outputs

- `build/webextension-v3.zip`
- `build/webextension-edge.zip`
- `build/changelog-vX.X.X.md`
- optional Safari Xcode project output under `build/`

## Final Handoff

Report:
- version used
- sync action taken
- commands run
- artifact paths, including which ZIP is for Edge
- release commit and tag
- Safari status
- changelog entries

Manual follow-up stays outside this skill:
- upload `build/webextension-v3.zip` to Chrome Web Store
- upload `build/webextension-v3.zip` to AMO if needed
- upload `build/webextension-edge.zip` to Microsoft Edge Add-ons
- handle Safari packaging only when the Safari build was explicitly requested
