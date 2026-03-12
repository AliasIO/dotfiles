---
name: action-wappalyzer-issues
description: Process the Wappalyzer GitHub detection issue backlog from oldest to newest and turn eligible tickets into pull requests. Use when Codex must read issue comments, decide whether a ticket maps to adding or updating a browser-extension technology definition, make the change in `extension/`, open a PR, then apply a non-`Acknowledged` label and close the actioned issue.
---

# Action Wappalyzer Issues

Use this skill when the task is to work the Wappalyzer issue queue end to end instead of handling a single local detection edit.

Read [queue-workflow.md](./references/queue-workflow.md) before changing GitHub state. Reuse the existing local skills instead of duplicating their logic:
- `github-wappalyzer-issues` for intake, scope checks, and issue classification
- `add-wappalyzer-technology` for live-site research, browser evidence capture, and `extension/` edits
- `/Users/elbert/Sites/dotfiles/codex/skills/github-wappalyzer-issues/scripts/fetch_issues.mjs` when a normalized issue+comments payload is more useful than raw `gh` output

## Workflow

1. List open issues in `wappalyzer/wappalyzer` oldest-first and inspect them in that order. Read the full issue body and every comment before deciding whether to act.
2. Only action tickets that result in either:
   - `Add <technology name>` for a new extension technology definition
   - `Update <technology name>` for an existing extension technology definition or metadata update
   Skip tickets that fall outside extension detection work, belong in another repo, or do not justify support.
3. Do the code change in `/Users/elbert/Sites/wappalyzer/extension` on a fresh `codex/...` branch. Do not leave the result as an unpublished local diff.
4. Validate with `yarn validate`, then commit with the same subject pattern the PR will use: `add <technology name>` or `update <technology name>`.
5. Open the PR in the same GitHub repo that owns the issue you are actioning. The PR body must summarize what changed, list the example websites used for evidence, and reference the original GitHub issue so the two are linked.
6. After the PR exists, apply the most accurate issue label in that same repo, never use `Acknowledged`, and then close the issue.
7. If no code change is warranted, still close extension-intake tickets that are clearly `Not eligible`, `More info needed`, `Already added`, or `Fixed` after applying the matching non-`Acknowledged` label. Before closing any ticket without `Accepted`, post a short issue comment that explains the reason. Leave the ticket untouched only when it is truly outside the extension queue scope or belongs in another repo.

## Label Rules

- Prefer `Accepted` when a new PR was opened from the current run.
- Prefer `Already added` when the requested technology or fix is already present and no new PR is needed.
- Prefer `Fixed` only when the needed change already exists on the default branch and no new PR is needed.
- Prefer `Not eligible` for extension-intake tickets that were reviewed but rejected on the project eligibility bar.
- Prefer `More info needed` for extension-intake tickets that could be actionable later but still lack enough reliable information to proceed.
- Query the live label list before editing labels instead of assuming names beyond these common cases.
- Never use `Acknowledged`.
- Leave a short issue comment when closing with any non-`Accepted` label so the reporter can see why the ticket was closed.
- For issue comments, prefer `gh issue comment --body-file /tmp/file.md` or a quoted here-doc over inline shell-quoted `--body` strings.
