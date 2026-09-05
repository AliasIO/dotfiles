---
name: publish-artifact-to-sites
description: "Publish a validated Data Analytics report or dashboard through Sites when that destination and access scope are authorized and the full hosting lifecycle is available."
---

# Publish Artifact To Sites

Use this skill after the report or dashboard workflow produces a complete canonical manifest and bounded snapshot and `validate_artifact` succeeds. It publishes the Data Analytics reader runtime as a Sites-hosted snapshot; it does not add live source connections to the Site.

## Routing Contract

Read [runtime and scope](../index/references/runtime-and-scope.md). Publish only to the destination and access scope authorized by the user, existing session, or an explicit applicable host delivery contract. Mode labels alone do not authorize publishing. Confirm the full lifecycle is actually callable before choosing Sites.

## Workflow

1. Confirm that `$sites-building` and `$sites-hosting` are both callable for the full Sites create, checkpoint, and deployment lifecycle.
2. Invoke `$sites-building` to create or reopen one worker-starter checkout per logical report or dashboard. For a new Site, select the worker starter (`--starter worker`). Reuse that Site for later versions.
3. Read the Site's current access policy with the Sites connector. Treat a workspace Site as verifiably owner-only only when it is `custom`, has exactly one `allowed_account_user_id`, its sole `allowed_users` entry has the same account-user id and a non-empty email, and it has no allowed groups. If the user asked to widen reader access, defer that access change until after the package is exported so the verified creator seed is not lost. Do not infer a creator from an already-shared reader allowlist.
4. Call `export_artifact_package` with the validated payload, the Sites project id in the compatibility field `site_creator_project_id`, and the returned checkout path as `output_dir`. When the current workspace policy is verifiably owner-only, pass its sole resolved email as `site_editor_email`; the exporter hashes it before writing source. Otherwise omit the field so an existing editor seed or explicit disabled state is preserved. Pass `site_editor_email: null` only when the user explicitly asks to disable presentation editing. After export succeeds, apply any reader-access change the user explicitly requested, then checkpoint and deploy with the same approval boundary.
5. Verify that every returned source/schema/hosting path is inside the checkout, and separately verify that the hosting metadata contains the resolved project id. Presentation editing requires the logical D1 binding `DB`; do not replace another binding name. A read-only export may omit `database_schema_path`.
6. Checkpoint the checkout through `$sites-building`, then invoke `$sites-hosting` to poll the deployment to a terminal state.
7. Return the Sites URL and artifact snapshot timestamp, and state that the published data is a snapshot rather than a live connection. When presentation editing is enabled, state that only the seeded creator can edit title/text/layout, delete blocks, or launch refresh and export handoffs; saved presentation overrides remain in Sites rather than syncing back to ChatGPT Desktop.

## Fallbacks And Failures

- If the full Sites lifecycle is unavailable or publishing fails after one targeted retry, retain reviewable work and follow the owning workflow's shared fallback policy. State the failed stage and do not claim publication.
- If the user explicitly requested only Sites, report the blocker instead of switching surfaces without their consent.
