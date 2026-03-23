---
name: mass-lookup-wappalyzer
description: Run, resume, monitor, and troubleshoot Wappalyzer AWS Batch mass lookups from `/Users/elbert/Sites/wappalyzer`, especially for large S3 inputs under `_other/utils/mass-lookup` and the `v4/apis/ecs` mass-lookup handlers.
---

# Mass Lookup Wappalyzer

Use this skill when the user wants to:
- run a new mass lookup from an S3 CSV or newline-delimited domain list
- check status, inspect summaries, or sample shard output
- troubleshoot stalled or failed mass-lookup Batch jobs
- update the mass-lookup utility, coordinator, or shard worker

This skill covers the reusable Batch flow under:
- `/Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup`
- `/Users/elbert/Sites/wappalyzer/v4/apis/ecs/handlers/mass-lookup*.js`

## Workflow

1. Check repo state first.
   - Review `git status --short` in `/Users/elbert/Sites/wappalyzer/v4/apis` and `/Users/elbert/Sites/wappalyzer/_other/utils`.
   - Do not touch unrelated dirt. `_other/utils` often has unrelated deletions; stage only the mass-lookup files you changed.

2. Read the runbook before acting.
   - For commands, resource names, defaults, and live gotchas, read [runbook.md](./references/runbook.md).

3. Prefer the existing utility and handlers.
   - The interactive entrypoint is `/Users/elbert/Sites/wappalyzer/_other/utils/mass-lookup/index.js`.
   - For unattended agent runs, prefer a direct Node snippet that imports the utility modules over racing the TTY prompts.

4. For code changes, edit the canonical locations.
   - Utility and setup flow: `_other/utils/mass-lookup`
   - Batch coordinator/worker/image: `v4/apis/ecs`
   - If a change affects runtime extraction behavior, update the canonical shared or CLI location too, per the repo AGENTS rules.

5. Validate and commit in the owning repo immediately.
   - Run focused `node --check` and `node --test` coverage for the touched mass-lookup files.
   - Commit in `/Users/elbert/Sites/wappalyzer/v4/apis` and `/Users/elbert/Sites/wappalyzer/_other/utils` separately.

6. Deploy when the handler or image changed.
   - Use the existing deploy path from `/Users/elbert/Sites/wappalyzer/v4/apis`:
     - `./run ecs deploy beta`
   - Report the resulting image digests and any skipped live checks.

7. When the user asks for a live run, stay with it through completion when feasible.
   - Watch the control job, then the shard jobs, then `progress/summary.json`.
   - Report the final `runPrefix`, normalized error buckets, and completion-email status.

## Reference Files

- [runbook.md](./references/runbook.md): detailed commands, resource names, S3 artifacts, recent validated behavior, and troubleshooting notes
