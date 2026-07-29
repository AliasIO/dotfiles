# Project Instructions

- After making task-owned file edits, inspect the staged diff and commit only those changes. Keep unrelated local edits intact.
- Keep BloomScout commits local unless the user explicitly asks to push or publish them. Do not infer push approval from a request to implement or commit.
- After making mobile app edits, rebuild/reinstall/launch the relevant simulator or emulator so the user can verify the changes.
- After making iOS app edits, rebuild/reinstall/launch the app in the simulator so the user can see the changes.
- For design or layout-only iOS app changes, rebuild/reinstall/launch after edits, but do not take screenshots or verify the layout in the simulator; the user will review those changes by eye.
- For small visual/layout-only app iterations, do not run the full test suite after every tiny tweak. Batch related changes and rebuild/reinstall/launch so the user can inspect them. Run targeted Android tests before commit when code paths, helpers, state rules, or tested constants changed. The iOS project currently has no test target, so use a successful app build plus manual verification unless a test target is added.
- Android requires JDK 21 and Android SDK 37; treat `android/README.md` and `android/app/build.gradle.kts` as authoritative when setup documentation disagrees.
- Use the `bloomscout` AWS profile with `AWS_REGION=us-east-1` for BloomScout AWS work. The profile must resolve to account `799414939380` through an assumed role whose name contains `BloomScout`; never use root credentials or the `pente` profile. Stop before any AWS mutation if the identity check fails.
- Do not create git branches for BloomScout work. Always edit files on `master`, and keep existing local edits instead of discarding or resetting them.
- Deploy the static website only when the user explicitly asks in the current request. Use `AWS_PROFILE=bloomscout AWS_REGION=us-east-1 npm run deploy` from `/Users/elbert/Projects/bloomscout`; the wrapper preserves live clean-URL objects until replacements are uploaded, removes stale managed objects afterward, and then invalidates CloudFront. Never substitute a raw `aws s3 sync --delete`.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Projects/dotfiles/codex/projects/bloomscout/AGENTS.md`; the repository-root file is a symlink.
