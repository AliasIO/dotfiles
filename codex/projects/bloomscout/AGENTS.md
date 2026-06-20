# Project Instructions

- After making any file edits, commit the changes to git.
- After making iOS app edits, rebuild/reinstall/launch the app in the simulator so the user can see the changes.
- For design or layout-only iOS app changes, rebuild/reinstall/launch after edits, but do not take screenshots or verify the layout in the simulator; the user will review those changes by eye.
- For small visual/layout-only app iterations, do not run the full test suite after every tiny tweak. Batch related changes, rebuild/reinstall/launch so the user can inspect them, and run targeted tests once before commit when code paths, helpers, state rules, or tested constants changed.
- Use the `bloomscout` AWS profile for BloomScout AWS work. Do not use the `pente` profile for this project.
- Do not create git branches for BloomScout work. Always edit files on `master`, and keep existing local edits instead of discarding or resetting them.
- Deploy the static website with `npm run deploy` from `/Users/elbert/Sites/bloomscout`. Do not run raw `aws s3 sync --delete` as the whole deploy because the private-S3 CloudFront setup relies on extensionless clean URL objects such as `privacy` and `find`; the deploy script rebuilds those objects from generated `*/index.html` files before invalidating CloudFront.
