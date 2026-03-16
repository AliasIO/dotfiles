# Deployment Targets

## Canonical Repo Rules

- Treat `cli/` as canonical for CLI and runtime behavior changes.
- Treat `v4/apis-shared/` as canonical for shared API logic and Lambda-layer code.
- Do not edit `v4/apis/*/wappalyzer`, `v4/apis/*/shared`, `cli/wappalyzer`, or `v4/apis/shared/nodejs` as the primary source of truth.
- If a deploy depends on new `cli/` or `v4/apis-shared/` commits, commit and push `master` there first, then move the parent repo gitlink in `v4/apis` or `_other/utils`.
- For `v4/apis/run`, let the helper handle submodule refresh so first-level submodules update before nested ones are synced.
- For shared-layer changes that affect `/opt/nodejs`, do not hand-edit `v4/apis/shared/nodejs`; push `v4/apis-shared` first and let `v4/apis/run` sync the mirrored submodule during deploy.

## `v4/apis`

Working directory: `/Users/elbert/Sites/wappalyzer/v4/apis`

Use `./run` for deploys instead of hand-rolled `sls` or Docker sequences.

Common commands:

```bash
./run sls deploy <stage> shared
./run sls deploy <stage> dependencies
./run sls deploy <stage> dep-geoip
./run sls deploy <stage> <api>
./run sls deploy <stage> <api> <function>
SLS_CONCURRENCY=<n> ./run sls deploy <stage> all
./run ecs deploy <stage>
./run test <stage> lookup
```

Notes:
- `./run sls deploy <stage> all` deploys `dependencies` and `shared` first, then the remaining services concurrently.
- `./run` exports both `PUPPETEER_SKIP_DOWNLOAD=true` and `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`.
- Layer deploys for `shared`, `dependencies`, and `dep-geoip` rewrite the corresponding version pins in `env.<stage>.yml`.
- `lookup` and `crawl-async` are the container-backed APIs. `ping` and `lookup-site` stay Lambda-plus-layer based.
- `./run sls deploy <stage> <api>` runs from the API subdirectory, so `_sub` output uses relative paths like `shared` and `../shared/nodejs` instead of the repo-root paths shown by top-level deploys.
- The current Serverless CLI schema can warn that `provider.runtime: nodejs22.x` is invalid even when the AWS deploy succeeds. Treat that as a schema-lag warning unless the deploy actually fails.
- For APIs that use `serverless-api-gateway-throttling`, the plugin applies throttling after the CloudFormation stack update. Do not treat the deploy as finished until the plugin prints its completion line and Serverless emits the final endpoint summary.
- `./run ecs deploy <stage>` builds both the main and batch ARM64 images, tags them for both `beta` and `v2`, and only pushes the requested `:<stage>` and `:<stage>-batch` tags to ECR.
- `./run ecs deploy <stage>` does not call `aws ecs update-service` or force a rollout. Treat it as an image-push step unless you separately confirm how the running ECS services refresh.
- The `_sub` phase prints intermediate remote-head checkouts before the final recursive sync restores nested submodules to the SHAs recorded by the updated parents. Use the last checkout lines or a post-run `git status` to judge the real end state.
- Large ECR layers can retry or time out transiently during `docker push`. One full retry of `./run ecs deploy <stage>` is reasonable before switching to ad hoc recovery, because cached builds and already-uploaded layers are reused.

Verification:
- Prefer `./run test <stage> lookup` after `lookup` deploys.
- For other APIs, run a target-specific curl or AWS check that matches the changed surface instead of assuming `lookup` coverage proves the whole deploy.

## `v4/frontend`

Working directory: `/Users/elbert/Sites/wappalyzer/v4/frontend`

Production deploy path:
1. Commit the frontend repo.
2. Push `master` to `origin`.
3. Watch `.github/workflows/deploy-v2.yml`.

Workflow facts:
- The workflow triggers on pushes to `master`.
- It runs `yarn deploy:v2`.
- It purges the production Cloudflare cache after the deploy completes.
- There is no supported `run` helper in `v4/frontend`; the deploy trigger is `git push origin master`, after which GitHub Actions owns the build and rollout.
- The workflow file is `.github/workflows/deploy-v2.yml`, but the run appears in GitHub Actions as `CI`. When using `gh`, filter by the workflow filename rather than the display name.

Verification:

```bash
gh run list --workflow deploy-v2.yml --limit 1
gh run watch <run-id>
curl -I https://www.wappalyzer.com
```

Notes:
- Default production deploys should rebuild the technology pages.
- The local `yarn deploy:v2` script is a valid manual deploy path when you intentionally want to run the website deploy from the frontend repo instead of waiting on GitHub Actions.
- `yarn deploy:quick:v2` is an exception path for an explicitly requested isolated fix or a fast manual test when a full rebuild is unnecessary.
- Do not run the local production deploy script by default when the GitHub Actions workflow is available.
