---
name: operate-wappalyzer-mass-lookup
description: Inspect, start, resume, troubleshoot, or repair Wappalyzer AWS Batch mass-lookup workflows from the Wappalyzer workspace. Use for mass-lookup S3 run prefixes, coordinator or shard status, explicit new or resumed live runs, Batch failures, and changes to the utility or ECS handlers. Status and troubleshooting are read-only; validated repairs are committed and pushed under the global delivery rule; starting, resuming, deployment, setup, and run submission require an explicit live-operation request.
---

# Operate Wappalyzer Mass Lookup

Select exactly one mode from the user's request. Read [references/runbook.md](./references/runbook.md) before using AWS or changing code.

## Modes

### Status

Inspect an existing run without changing AWS, S3, Batch, or repository state. Require or discover the run S3 prefix, then read its manifest and progress summary. Discover current resource names and region before querying Batch.

### Start

Start a new live run only when the user explicitly requests it. Discover current configuration; do not reuse resource IDs, quotas, recipients, or run prefixes from documentation or prior runs. Confirm the input S3 URI and requested lookup/crawl options, submit once, record the returned job ID and run prefix, then switch to Status until terminal unless the user requested dispatch only.

### Resume

Resume only an explicitly identified existing run. Read its manifest and current Batch state first. Do not submit a second coordinator while one is active. Preserve the manifest's input and options unless the user explicitly changes them. Record the new coordinator ID, then switch to Status.

### Troubleshoot

Diagnose read-only by default: inspect the manifest, summary, Batch parents and children, logs, and current resource health in that order. Do not cancel, terminate, resubmit, modify resources, deploy, or patch code unless the user separately requests that action.

### Local Repair

Change only canonical mass-lookup code, preserve unrelated worktree changes, and run focused checks and tests. Commit and push validated task-owned repairs under the global delivery rule. Do not deploy, set up Batch resources, or start/resume a run in this mode; report any required deployment or live validation as follow-up.

## Boundaries

- Treat `status` and `troubleshoot` as read-only.
- Treat `start` and `resume` as live mutations requiring explicit intent.
- Treat the utility's `setup` action as a separate infrastructure mutation; never infer it from troubleshooting.
- Discover mutable AWS values at execution time. Never copy identifiers, email addresses, capacities, or historical-run values from prose.
- Work inside the owning repositories under `$HOME/Projects/wappalyzer`; the workspace root is not a Git repository.
