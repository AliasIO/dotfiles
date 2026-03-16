---
name: deploy-wappalyzer
description: Deploy Wappalyzer services from `/Users/elbert/Sites/wappalyzer`. Use when Codex needs to ship or verify changes in `v4/apis`, `v4/apis-shared`, `cli`, or `v4/frontend`; choose the correct deployment path for the target; sync canonical repos and submodule pointers safely; prefer workflow-driven frontend deploys; and run target-appropriate smoke checks after deployment.
---

# Deploy Wappalyzer

Use this skill to map a code change to the correct deployment path in the Wappalyzer workspace. Start by identifying which repo owns the change, then load the matching section in [targets.md](./references/targets.md).

## Workflow

1. Identify the canonical repo for the change.
   - `cli/` owns CLI, runtime, and browser-behavior changes.
   - `v4/apis-shared/` owns shared API and Lambda-layer logic.
   - `v4/frontend/` owns the main website deploy.
2. Check repo state before deploying.
   - Review `git status --short` in every repo you will push or use for gitlinks.
   - Keep canonical repos on `master` when a deploy depends on newer `cli/` or `v4/apis-shared/` commits.
   - Do not edit or deploy from checked-out submodule copies such as `v4/apis/*/wappalyzer` or `v4/apis/*/shared`.
3. Follow the target-specific deploy path in [targets.md](./references/targets.md).
4. Prefer the approved entrypoint over ad hoc commands.
   - `v4/apis`: use `./run`.
   - `v4/frontend`: push `master` and monitor GitHub Actions.
5. Verify the deploy and report the result.
   - Include the repo, branch, and commit pushed or deployed.
   - Include the command or workflow used.
   - Include the smoke test or verification result.
   - Call out any skipped checks or follow-up gitlink updates.

## Guardrails

- Keep `--single-process`; do not reintroduce multi-process crawler behavior.
- For container API work that installs Puppeteer, keep `PUPPETEER_SKIP_DOWNLOAD=true`. `v4/apis/run` already exports it.
- When `v4/apis-shared` changes affect `/opt/nodejs`, make the edit in `v4/apis-shared`, commit and push `master`, then let `v4/apis/run` refresh `shared/nodejs` and other submodules during deploy. Do not hand-edit `v4/apis/shared/nodejs/`.
- When CLI or shared-layer changes are required by `v4/apis`, push the canonical repo first, then update the parent repo gitlink instead of patching submodule copies.
- In `v4/apis/run`, first-level submodules must advance before the recursive non-remote sync. Use the existing `./run` helper instead of reproducing this manually.
- `lookup` and `crawl-async` stay container-based. `ping` and `lookup-site` stay Lambda-plus-layer based.
- For `v4/frontend` production, do not run the local website deploy script by default. Push the frontend repo and let GitHub Actions deploy. Use quick deploys only when the user explicitly wants that exception for an isolated fix.
