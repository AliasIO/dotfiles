# Project Instructions

- After making any file edits, commit the changes to git.
- After making iOS app edits, rebuild/reinstall/launch the app in the simulator so the user can see the changes.
- For design or layout-only iOS app changes, rebuild/reinstall/launch after edits, but do not take screenshots or verify the layout in the simulator; the user will review those changes by eye.
- Use the `bloomscout` AWS profile for BloomScout AWS work. Do not use the `pente` profile for this project.
- Do not create git branches for BloomScout work. Always edit files on `master`, and keep existing local edits instead of discarding or resetting them.
- Deploy the static website with `npm run deploy` from `/Users/elbert/Sites/bloomscout`. Do not run raw `aws s3 sync --delete` as the whole deploy because the private-S3 CloudFront setup relies on extensionless clean URL objects such as `privacy` and `find`; the deploy script rebuilds those objects from generated `*/index.html` files before invalidating CloudFront.
