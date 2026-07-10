# Project Instructions

- Start implementation work from `origin/master` in an isolated Git worktree on an `agent/<short-description>` branch. Do not switch or reuse the long-lived dirty primary worktree.
- After making task-owned file edits, inspect the staged diff, commit only those changes, push the task branch, and open a draft pull request. Never push directly to `master`.
- Treat the existing unpublished local `master` history as a separate backlog. Do not fold, rebase, or publish it with a new task branch unless the user explicitly asks.
- After making mobile app edits, rebuild/reinstall/launch the relevant simulator or emulator so the user can verify the changes.
- After making iOS app edits, rebuild/reinstall/launch the app in the simulator so the user can see the changes.
- For design or layout-only iOS app changes, rebuild/reinstall/launch after edits, but do not take screenshots or verify the layout in the simulator; the user will review those changes by eye.
- For small visual/layout-only app iterations, do not run the full test suite after every tiny tweak. Batch related changes and rebuild/reinstall/launch so the user can inspect them. Run targeted Android tests before commit when code paths, helpers, state rules, or tested constants changed. The iOS project currently has no test target, so use a successful app build plus manual verification unless a test target is added.
- Android requires JDK 21 and Android SDK 37; treat `android/README.md` and `android/app/build.gradle.kts` as authoritative when setup documentation disagrees.
- Use the `bloomscout` AWS profile with `AWS_REGION=us-east-1` for BloomScout AWS work. The profile must resolve to account `799414939380` through an assumed role whose name contains `BloomScout`; never use root credentials or the `pente` profile. Stop before any AWS mutation if the identity check fails.
- Require the `Website and backend` and `Android` CI checks before merging to protected `master`. Keep unrelated local edits intact and never reset or clean them.
- Deploy the static website only when the user explicitly asks in the current request. Use `AWS_PROFILE=bloomscout AWS_REGION=us-east-1 npm run deploy` from `/Users/elbert/Sites/bloomscout`; the wrapper preserves live clean-URL objects until replacements are uploaded, removes stale managed objects afterward, and then invalidates CloudFront. Never substitute a raw `aws s3 sync --delete`.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Sites/dotfiles/codex/projects/bloomscout/AGENTS.md`; the repository-root file is a symlink.
