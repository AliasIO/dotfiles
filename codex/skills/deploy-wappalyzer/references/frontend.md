# Frontend Deployment

Working directory: `$HOME/Projects/wappalyzer/v4/frontend`

## Production trigger

- `.github/workflows/deploy-v2.yml` owns production deployment.
- Every push to `master` triggers a quick production build (`yarn deploy:quick:v2`) and cache purge.
- A manual workflow dispatch can choose `quick` or `full`; use `full` when technology, category, comparison, or other generated-page content must be rebuilt.
- Because a `master` push itself deploys, require explicit Operate authority before pushing it.
- Do not run local `yarn deploy:*` by default when the workflow is available.

## Rollout

1. Confirm local validation and a clean task-owned commit.
2. Decide whether the automatic quick build is sufficient. If a full build is required, state that a master push also triggers quick and explicitly dispatch the full workflow after publication.
3. Push the intended `master` commit only with Operate authority.
4. Capture the workflow run ID. Acknowledge “dispatched” before verification.
5. Perform a one-shot status inspection and a narrow HTTP/product smoke check. Watch continuously only when requested.

```bash
gh run list --workflow deploy-v2.yml --limit 3
gh run view <run-id>
curl -I https://www.wappalyzer.com
```

For a full workflow dispatch:

```bash
gh workflow run deploy-v2.yml --ref master -f build_mode=full
```

Report quick/full mode, commit, run URL/ID, current conclusion, HTTP smoke result, and whether continuous monitoring was requested.
