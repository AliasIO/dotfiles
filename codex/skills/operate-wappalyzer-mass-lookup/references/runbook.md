# Mass-Lookup Runbook

Status: operational workflow; live run and resource values require discovery  
Owner: Wappalyzer data operations  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: mass-lookup utility code, ECS coordinator and worker handlers, run manifests, stage configuration, and live AWS Batch/S3 state  
Verify with: inspect the owning repositories and current run manifests, then query the configured AWS profile, region, queues, job definitions, compute environments, jobs, and S3 prefix

## Canonical Locations

- Utility and submission flow: `$HOME/Sites/wappalyzer/_other/utils/mass-lookup`
- Coordinator and worker runtime: `$HOME/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-common.js`, `mass-lookup-coordinator.js`, and `mass-lookup.js`
- Batch image: `$HOME/Sites/wappalyzer/v4/apis/ecs`

Inspect both owning repositories before local repair:

```bash
git -C "$HOME/Sites/wappalyzer/_other/utils" status --short
git -C "$HOME/Sites/wappalyzer/v4/apis" status --short
```

## Discover Current Configuration

Never rely on remembered resource names or values. Before a live query or mutation:

1. Inspect `constants.js`, `env.js`, `batch.js`, and the relevant stage environment files.
2. Resolve the current AWS profile and region from code or environment.
3. Use read-only AWS `list` and `describe` calls to verify queues, job definitions, compute environments, quotas, and active jobs.
4. Derive the bucket and run prefix from the user-supplied S3 URI or current manifest.

Do not record mutable IDs, account details, email recipients, capacities, generated cluster names, or prior-run prefixes in this skill.

## Utility Entry Point

Run the maintained utility from its directory:

```bash
cd "$HOME/Sites/wappalyzer/_other/utils/mass-lookup"
node index.js
```

It exposes setup, start, status, and resume actions. Select only the action authorized by the active skill mode. For unattended use, inspect the current exports from `env.js`, `logic.js`, and `batch.js` and compose a direct Node invocation; do not retain a copied submission snippet after the utility changes.

## Status

The durable run objects are:

- `s3://<bucket>/<run-prefix>/manifest/run.json`
- `s3://<bucket>/<run-prefix>/manifest/shards.json`
- `s3://<bucket>/<run-prefix>/progress/summary.json`
- `s3://<bucket>/<run-prefix>/progress/summary.txt`

Read objects without downloading them into the workspace:

```bash
aws s3 cp "s3://$bucket/$run_prefix/manifest/run.json" - --profile "$profile" --region "$region"
aws s3 cp "s3://$bucket/$run_prefix/progress/summary.json" - --profile "$profile" --region "$region"
```

Report status, processed and total URLs, successes, normalized errors, throughput/ETA when present, active Batch work, and completion-notification status without exposing recipient data.

## Durable Output Contract

Final shard output lives at `output/shards/shard-<id>.json.gz` as gzipped NDJSON. Each line contains a URL, status, status text, and technology array. Preserve the current normalized-error behavior from `mass-lookup-common.js`; do not copy host-specific failure details into aggregate error buckets.

Progress summaries may include cache lookups/hits/misses, hit rate, throughput, startup and processing durations, estimated total time, and ETA. Completion state in `manifest/run.json` records whether notification was attempted, sent, or failed. Report those states without exposing the recipient or sender.

## Start

Require an input S3 URI. Obtain lookup mode, crawl scope, maximum wait, and optional run-folder choice from the user or the utility's current defaults. Load current stage environment through `env.js`, obtain live quota targets through `batch.js`, write the runtime environment object, and submit one coordinator with `RESUME=false` through the maintained utility functions.

Do not run setup automatically. If required resources are absent or unhealthy, stop and report the separate infrastructure action needed.

## Resume

Read `manifest/run.json` before submitting. Verify the run is incomplete and no coordinator is active. Reuse its run ID, input key, run prefix, lookup mode, crawl scope, and maximum wait. Refresh the runtime environment using current discovery, then submit one coordinator with `RESUME=true`.

Never clear manifests, shard state, output, or checkpoints merely to make resume proceed. Escalate destructive repair separately.

## Troubleshooting Order

1. Read `manifest/run.json` and `progress/summary.json`.
2. Discover and describe the coordinator job.
3. Describe recorded array parents and list failed/running child jobs.
4. Inspect relevant CloudWatch logs.
5. Describe current queues and compute environments.
6. Check S3 shard progress, checkpoints, and output presence.
7. Only then identify a code, configuration, capacity, or input fault.

A `RUNNABLE` job can indicate capacity or compute-environment startup; zero shard progress can be normal during startup. Base the conclusion on current describe results, not elapsed time alone.

If completion notification fails, discover the current task role and verify its SES send permissions and configured sender instead of relying on remembered role names or addresses.

## Local Repair and Validation

Edit utility/setup behavior under `_other/utils/mass-lookup` and coordinator/worker/image behavior under `v4/apis/ecs`. Follow the project AGENTS rules for shared extraction or CLI behavior.

Run the applicable checks:

```bash
node --check "$HOME/Sites/wappalyzer/_other/utils/mass-lookup/index.js"
node --test "$HOME/Sites/wappalyzer/_other/utils/mass-lookup/env.test.js" \
  "$HOME/Sites/wappalyzer/_other/utils/mass-lookup/logic.test.js"
node --check "$HOME/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-common.js"
node --check "$HOME/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-coordinator.js"
node --check "$HOME/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup.js"
node --test "$HOME/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-common.test.js" \
  "$HOME/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-coordinator.test.js"
```

If ECS runtime files changed, report that the Batch image must be deployed before live validation. Deployment, resource setup, and run submission require their own explicit authorization.
When deployment is explicitly authorized, discover the stage and use the repository's current `./run ecs deploy <stage>` path; never assume a stage from this runbook.
