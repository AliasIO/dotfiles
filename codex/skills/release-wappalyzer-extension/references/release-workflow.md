# Extension Release Workflow

## Repository

- Checkout: `$HOME/Projects/wappalyzer/extension`
- Required branch: `master`
- Required upstream: `origin/master`
- Canonical version: `src/manifest.json`

## Mode Contract

### Inspect

Read local state only. Do not fetch, pull, edit, build, commit, tag, push, or upload. Ahead/behind values use cached `origin/master` refs and must be labeled accordingly.

### Prepare

Require clean tracked files and the expected branch/upstream. Fetch `origin master` and tags, stop on divergence, and fast-forward local `master` when behind. If local is ahead, defer the push. Then:

1. Select an explicit numeric `x.y.z` version or patch-bump the manifest version.
2. Reject an existing tag.
3. Update `src/manifest.json`.
4. Run `yarn build:release`.
5. Verify the Chromium/Firefox and Edge ZIPs.
6. Optionally run `yarn build:safari` when requested.
7. Generate the changelog.
8. Record the base commit, tracked-diff digest, and SHA-256 digest of every ZIP, changelog, and Safari project in `build/.release-preparation.json`.

Never commit, tag, or push in Prepare mode. Leave the validated local state for review or a later explicit Release.

### Release

Use only after an explicit release request. Consume a prepared state only when its base commit, manifest version, tracked diff, requested version, Safari choice, artifact set, and artifact digests still match. Otherwise require a clean tree and prepare first.

Refresh remote refs before publication. Stop if `origin/master` advanced or diverged. Create `Build vX.Y.Z`, tag it `vX.Y.Z`, and atomically push `master` plus the tag. Stage tracked changes only; never sweep unrelated untracked files into the release commit.

Release mode authorizes the Git commit, tag, and push only. It does not authorize browser-store uploads.

## Build Outputs

- Chrome and Firefox: `build/webextension-v3.zip`
- Microsoft Edge: `build/webextension-edge.zip`; its packaged manifest omits `background.scripts`
- Changelog: `build/changelog-vX.Y.Z.md`
- Optional Safari Xcode output under `build/`

Keep the canonical manifest background block compatible with Chrome and Firefox.

## Changelog

During preparation, compare the previous `Build v...` marker with current `HEAD`.

Scan non-merge commits whose subjects begin with `add`, `update`, or `fix`, case-insensitively. Derive names from changes to `src/technologies/*.json`:

- emit `ADD` for a new technology key
- emit `FIX` for a changed existing key
- ignore removals and non-technology changes
- format exactly as `* \`ADD\` Name detection` or `* \`FIX\` Name detection`
- Sort the complete rendered lines lexicographically before writing the changelog so all `ADD` entries precede all `FIX` entries and names are alphabetical within each group.

## Handoff

Report the selected mode, version, local synchronization, commands, artifacts, changelog entries, and Safari status. In Release mode also report the commit and tag. State explicitly that store upload was not performed.
