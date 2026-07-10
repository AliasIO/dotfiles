# Data and Batch Runbook

Status: operational contract; live capacity and task values require discovery  
Owner: Wappalyzer data operations  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: shared dataset code, ECS handlers, stage configuration, DynamoDB autoscaling, Batch, and ECS task definitions  
Verify with: inspect table billing/autoscaling, current code constants, active task/job revisions, caller environment, and IAM policies

## Capacity and exports

- Inspect table billing mode first. On-demand tables skip provisioned/autoscaling mutations; provisioned tables use current configured floors and restore values from code/configuration.
- Keep the capacity-floor callers in dataset export and technology-summary jobs while the dataset table is provisioned. Removing the caller silently removes the temporary floor contract.
- Keep temporary capacity ownership paired with terminal cleanup. Do not restore an observed prior high floor when the workflow contract specifies a fixed baseline.
- Technology exports, including baselist exports, use the configured technology read floor. Treat autoscaling concurrent-update conflicts as best-effort rather than failing the export.
- Do not persist write-floor restore snapshots when the policy owns a fixed baseline.
- Keep exact hostname/domain totals disk-backed. Large technology summaries, firmographics merges, and weekly cache builds must not accumulate full-volume maps in the JS heap.

## Dataset and lead-list contracts

- Keep the default enriched lead-list subset capped at the configured shared limit; align all callers when changing it.
- Freshness-window `rootPath` / “On homepage” values come from the newest verification for the queried technology, not an OR with older months.
- Normalize language base codes and locale casing consistently across frontend validation, API input, and stored values. Reject expression-size overflows before queueing.
- Strip null/empty placeholders before keyword normalization. Missing row hostnames behave as empty strings during keyword filtering.
- Shard broad technology-month queries by reversed-hostname ranges, stop launching shards after the result cap, and batch hostname enrichment with parallel 100-key pages.
- Prefetch only the next enrichment batch and evict completed caches; do not retain every batch map.
- Website keyword search keeps exact total results while limiting the returned page independently. Category and technology list endpoints use precomputed summaries, never interactive full-table scans.
- Publish completed technology caches to their index incrementally so finished artifacts become discoverable before the whole build ends.
- Treat `USER_NOT_FOUND` and `USER_NOT_ENABLED` as handled terminal list failures: mark the list failed without rethrowing or sending a system-error alert.
- Lead-list recalculation executes in the ECS list handler. A shared dataset fix requires the ECS image rollout before reprocessing; deploying only list Lambdas or the shared layer is insufficient.
- Keep repeat-list recreation and shared-cache refresh on separate entrypoints. Use the dedicated disk-backed cache builder for the largest technologies.

## Batch and ECS contracts

- A coordinator waiting on Batch needs Batch permissions on its ECS task role. Custom metrics need `cloudwatch:PutMetricData` on that same role.
- Child tasks use their own credentials. Remove parent credential/metadata variables and invalid host temp paths from forwarded environments.
- Keep every launch caller’s environment aligned with the shared whitelist; a value present on one Lambda but omitted from `runEcsTask()` is not delivered.
- Use a real init such as `tini` for Chromium containers so PID 1 reaps children.
- Lean task families are only for handlers that cannot reach browser analysis or local GeoIP. Discover the current family capabilities before assigning a cron or list job.
- Use storage/memory-appropriate task families for monthly technology summaries, verified-email hostname reconciliation, and large list/cache jobs. Query the current revision rather than copying a family suffix from prose.
- An ECS image build/push is not an ECS service rollout. Confirm how the target consumes a new tag or digest.
- Scope completion rules to the job family plus terminal states. Keep spot retries narrow: retry host loss, not deterministic application/container failures.
- Avoid synchronous manual Lambda invokes for submitters that can outlive the client timeout; use async invocation or a deliberately longer client timeout to prevent duplicate submissions.
- Cancel/restart races can let the old parent’s terminal callback overwrite a replacement order. Recheck the order state while the new parent is active.
- Bulk crawl keeps capacity changes aligned across submitter, array workers, and the dependent finalizer. Coverage scans use stable UTC-day segmentation over the stale/unattempted window; do not cap one unsliced scan that repeatedly favors early rows.
- Discover whether a compute environment is shared by stages before launch-template or disk changes; a beta-named operation can still affect production capacity.

## Firmographics and hostname materialization

- Bound S3 stream inactivity and rewind per-file statistics before retrying a partially read file.
- Stream and disk-back reject-list merges; add progress logs and watchdogs around partitioning, sorting, and aggregation.
- Emit partitioned canonical-domain decisions and resolve them lazily in shards rather than loading the global manifest in every child.
- Read company, social, and contact fields materialized on hostname rows. Prefer root-domain values for those fields while retaining exact-host values for other attributes.
