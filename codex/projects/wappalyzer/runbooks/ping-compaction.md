# Ping and Compaction Runbook

Status: operational contract; discover live targets before use  
Owner: Wappalyzer data operations  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: `v4/apis-shared/ping-*.js`, ECS cron handlers, stage configuration, DynamoDB, S3, and Batch  
Verify with: inspect the control row, slice rows, source snapshot, current job definition, queue, image digest, and relevant environment

## Data contract

- Accept only `PING_WRITE_MODE=sync|async|disabled`; compare/shadow paths stay removed.
- Use server `receivedAt` for partitions and make applies idempotent by day.
- Ping-created or refreshed hostname rows never set `crawlAttemptedAt`.
- Aggregate technology versions through map/reduce and persist only versions meeting the configured minimum hit threshold.
- Bound language-hit updates before DynamoDB expression construction. Treat oversized update-expression validation as a terminal slice failure.

## Controller and slice behavior

- Retry transient S3 and DynamoDB transport failures such as DNS resolution, reset, and timeout errors inside the worker before burning a slice.
- Use `expiresAt` only for DynamoDB TTL. Reserve `staleAt` for heartbeat and lock recovery.
- Keep compaction apply-only. Do not restore compare-only state, environment knobs, or alarms.
- Send terminal mail only on the reconcile transition into completed or failed. Re-polling an already-terminal row stays silent.
- Keep `snapshotAvailable=false` until `run.json` exists. A planned key without a snapshot starts a fresh attempt rather than resuming.
- Gate weekly apply creation on completion of every required daily map; do not rely on a fixed delay.
- Keep map-source retention longer than the maximum weekly window. Discover the active S3 lifecycle before enabling or changing the weekly schedule.
- Suppress non-terminal reconcile mail. Do not leave a date override on live starter/reconcile functions after a deliberate replay.

## Manual replay

1. Inspect and record the parent, slices, attempt, snapshot, map prefixes, and active jobs.
2. If clearing a parent for the same date/attempt, also clear that attempt’s map prefix and matching slice rows; stale artifacts can inflate counts or inherit completed work.
3. Confirm no old controller/finalizer can write terminal state over the replacement run.
4. Use a dedicated ping Batch target. For urgent fixes, select a new job-definition revision pinned to the pushed image digest rather than relying on a mutable tag cached by an EC2 host.
5. Reconcile counts and terminal state before declaring the replay complete.
