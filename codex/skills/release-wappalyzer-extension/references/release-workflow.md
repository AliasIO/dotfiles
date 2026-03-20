# Release Workflow

## Repo

- Repo: `/Users/elbert/Sites/wappalyzer/extension`
- Branch: `master`
- Upstream: `origin/master`

## Versioning

- Read the current version from `src/manifest.json`.
- If no version is provided, patch-bump the current version by one.
- Require numeric `x.y.z` versions.
- Keep the bumped version in `src/manifest.json` after the build.

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

Rules:
- use non-merge commit subjects only
- keep only `Add`, `Update`, and `Fix` detection subjects
- drop any trailing ` / <category>` suffix
- dedupe repeated technologies
- map `Add` to `ADD`
- map both `Update` and `Fix` to `FIX`
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
