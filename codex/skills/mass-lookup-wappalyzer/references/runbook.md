# Mass Lookup Runbook

## Scope

This runbook covers the reusable AWS Batch mass-lookup flow in:
- `/Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup`
- `/Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-common.js`
- `/Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-coordinator.js`
- `/Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup.js`

Defaults verified on `2026-03-23`:
- stage: `beta`
- shard size: `250`
- outer concurrency per shard: `30`
- lookup mode default: `cache-then-crawl`
- homepage mode: `maxUrls=1`
- recursive mode: `batchSize=1`, `maxUrls=5`
- completion email: `to=elbert@wappalyzer.com`, `from=SES_SYSTEMS_EMAIL` / `systems@wappalyzer.com`

## Resource Names

Batch compute environments:
- `wappalyzer-mass-lookup-beta-control`
- `wappalyzer-mass-lookup-beta-ondemand`
- `wappalyzer-mass-lookup-beta-spot`

Batch job queues:
- `wappalyzer-mass-lookup-beta-control`
- `wappalyzer-mass-lookup-beta-ondemand`
- `wappalyzer-mass-lookup-beta-spot`

Batch job definitions:
- `wappalyzer-mass-lookup-beta-control`
- `wappalyzer-mass-lookup-beta-ondemand`
- `wappalyzer-mass-lookup-beta-spot`

Dedicated task role:
- `wappalyzer-mass-lookup-beta-task`

Important quotas and caps seen live on `2026-03-23`:
- standard on-demand target used by setup: `1266` vCPUs
- standard spot target used by setup: `1139` quota, `1600` CE max cap, quota-limited in practice

## Canonical Commands

Check repo state:

```bash
git -C /Users/elbert/Sites/wappalyzer/v4/apis status --short
git -C /Users/elbert/Sites/wappalyzer/_other/utils status --short
```

Deploy the batch image after `v4/apis/ecs` changes:

```bash
cd /Users/elbert/Sites/wappalyzer/v4/apis
./run ecs deploy beta
```

Run focused validation:

```bash
node --check /Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-common.js
node --check /Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-coordinator.js
node --check /Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup.js
node --test /Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-common.test.js /Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup-coordinator.test.js
node --check /Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup/index.js
```

## Starting a Run

Interactive entrypoint:

```bash
cd /Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup
node index.js
```

For unattended agent use, prefer a direct Node submission snippet so the prompt timing does not race:

```js
const path = require('node:path')
const { loadStageEnv } = require('/Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup/env')
const {
  createRunId,
  parseS3Uri,
  buildDefaultRunFolderName,
  buildRunPrefix,
} = require('/Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup/logic')
const {
  writeJsonObject,
  getRuntimeEnvKey,
  submitCoordinatorJob,
  getLiveQuotaTargets,
  RESOURCE_NAMES,
} = require('/Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup/batch')

// Use cache-then-crawl + homepage unless the user requested otherwise.
```

Required submission environment:
- `HANDLER=mass-lookup-coordinator`
- `RUN_BUCKET`
- `INPUT_KEY`
- `RUN_ID`
- `RUN_PREFIX`
- `LOOKUP_MODE`
- `CRAWL_SCOPE`
- `MAX_WAIT`
- `RESUME`
- queue + job-definition names
- `MASS_LOOKUP_RUNTIME_ENV_BUCKET`
- `MASS_LOOKUP_RUNTIME_ENV_KEY`

## Monitoring a Run

Primary status objects:
- `s3://<bucket>/<runPrefix>/manifest/run.json`
- `s3://<bucket>/<runPrefix>/progress/summary.json`
- `s3://<bucket>/<runPrefix>/progress/summary.txt`

Helpful commands:

```bash
aws s3 cp s3://wappalyzer-mass-lookup/<runPrefix>/progress/summary.json - --profile wappalyzer --region us-east-1
aws s3 cp s3://wappalyzer-mass-lookup/<runPrefix>/manifest/run.json - --profile wappalyzer --region us-east-1
aws s3 ls s3://wappalyzer-mass-lookup/<runPrefix>/output/shards/ --profile wappalyzer --region us-east-1
```

Batch visibility:

```bash
aws batch describe-jobs --jobs <coordinator-job-id> --profile wappalyzer --region us-east-1
aws batch list-jobs --job-queue wappalyzer-mass-lookup-beta-control --job-status RUNNABLE --profile wappalyzer --region us-east-1
aws batch list-jobs --job-queue wappalyzer-mass-lookup-beta-ondemand --job-status RUNNING --profile wappalyzer --region us-east-1
aws batch list-jobs --job-queue wappalyzer-mass-lookup-beta-spot --job-status RUNNING --profile wappalyzer --region us-east-1
```

ECS cluster visibility when Batch says `RUNNABLE` for a long time:

```bash
aws ecs list-container-instances --cluster AWSBatch-wappalyzer-mass-lookup-beta-control-8254c4b2-22f9-3fd1-9bf6-ccbb5e32bcf8 --profile wappalyzer --region us-east-1
aws ecs list-container-instances --cluster AWSBatch-wappalyzer-mass-lookup-beta-ondemand-f98ed2cd-d71c-39ea-a289-124e93efb59f --profile wappalyzer --region us-east-1
aws ecs list-container-instances --cluster AWSBatch-wappalyzer-mass-lookup-beta-spot-01136997-c1f4-3ed1-8a17-8cbc757a1b56 --profile wappalyzer --region us-east-1
```

## Output Shape

Per-shard final output:
- `output/shards/shard-000001.json.gz`
- gzipped NDJSON

Result line shape:

```json
{"url":"https://example.com/","status":"success","statusText":"","technologies":[{"name":"Cloudflare","versions":[],"categories":["CDN"]}]}
```

Error line shape:

```json
{"url":"https://bad.example/","status":"error","statusText":"DNS could not be resolved","technologies":[]}
```

Progress summary fields now include:
- `cacheLookups`
- `cacheHits`
- `cacheMisses`
- `cacheHitRate`
- `urlsPerMinute`
- `startupMs`
- `processingElapsedMs`
- `estimatedTotalMs`
- `etaMs`
- `etaAt`

Completion email fields in `manifest/run.json`:
- `completionEmailTo`
- `completionEmailFrom`
- `completionEmailAttemptedAt`
- `completionEmailSentAt`
- `completionEmailError`

## Recent Verified Runs

Successful 5k homepage run with summary email:
- input: `s3://wappalyzer-mass-lookup/test2/list-5000.csv`
- run prefix: `s3://wappalyzer-mass-lookup/test2/list-5000-mn2mct47-l96o7w/`
- final status: `complete`
- final counts:
  - `totalUrls=5054`
  - `successCount=4989`
  - `errorCount=65`
  - `cacheHits=4989`
  - `cacheMisses=29`
- completion email:
  - attempted and sent at `2026-03-23T03:27:12.375Z`
  - sender: `Wappalyzer <systems@wappalyzer.com>`

Successful one-row smoke run after summary enhancements:
- input: `s3://wappalyzer-mass-lookup/test/test.csv`
- run prefix: `s3://wappalyzer-mass-lookup/test/test-mn2lay0k-3r7lfk/`
- validated:
  - new cache summary fields
  - completion email manifest fields

## Known Gotchas

1. The interactive TTY prompts can race when automated.
   - For agent-driven runs, prefer a direct Node snippet that imports the utility modules and submits the coordinator job programmatically.

2. A run can sit with only `manifest/runtime-env.json` written while the control job is still `RUNNABLE`.
   - Check the control queue and ECS container instances before assuming the coordinator is broken.

3. Shard progress may stay at zero for a while even after the array jobs are visible.
   - This is normal during Batch/ECS warm-up. Check `describe-jobs` on the shard parents for `RUNNING` / `STARTING` child counts.

4. Completion email depends on the dedicated task role.
   - `wappalyzer-mass-lookup-beta-task` must allow `ses:SendEmail` / `ses:SendRawEmail`.
   - The sender should stay `SES_SYSTEMS_EMAIL`, currently `Wappalyzer <systems@wappalyzer.com>`.

5. `_other/utils` often has unrelated deletions in the worktree.
   - Stage only the files under `_other/utils/mass-lookup` that you actually changed.

6. The workspace root `/Users/elbert/Sites/wappalyzer` is not a git repo.
   - Commit inside the owning repos such as `/Users/elbert/Sites/wappalyzer/v4/apis` and `/Users/elbert/Sites/wappalyzer/_other/utils`.

## Troubleshooting Order

When a live run looks wrong, follow this order:

1. `aws batch describe-jobs` on the coordinator
2. `aws s3 ls` for the run prefix
3. `manifest/run.json`
4. `progress/summary.json`
5. shard parent array status via `describe-jobs`
6. ECS container instances for control, on-demand, and spot clusters
7. only then patch code or resubmit work
