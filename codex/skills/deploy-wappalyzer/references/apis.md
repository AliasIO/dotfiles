# API and ECS Deployment

Working directory: `$HOME/Sites/wappalyzer/v4/apis`

## Preflight

- Confirm the target stage and explicit authority. `v2` and any beta service sharing a live resource require explicit production-impact permission.
- Run dependency propagation before deployment when the change originates in `cli` or `v4/apis-shared`.
- Inspect the parent repository, exact gitlinks, stage env changes, attached layer consumers, Docker/package copy paths, and target-specific tests.
- Use `./run`; do not rebuild its Serverless, Docker, or submodule sequence ad hoc.

## Supported entrypoints

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

- An all-service deploy publishes foundational layers before other services.
- Layer deployment can rewrite `env.<stage>.yml` version pins; redeploy every intended consumer and verify its attached ARN.
- `lookup` and `crawl-async` are container APIs. `ping` and `lookup-site` consume Lambda layers.
- `./run ecs deploy` builds and pushes main/batch image tags. It does not call `aws ecs update-service`; verify the consuming service/job definition separately.
- A Serverless schema warning is not a deploy failure when CloudFormation and plugin completion succeed, but record it and inspect the final service output.

## Verification

- Use `./run test <stage> lookup` only for lookup changes.
- For another service, run a narrow authenticated/public request or read-only AWS inspection matching that surface.
- Verify the deployed function/image/layer revision, not just local configuration.
- For a shared live resource, inspect adjacent stage behavior as part of the smoke check.
- Report skipped checks and whether the action merely pushed an image, published a layer, updated a function, or completed a full rollout.
