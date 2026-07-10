# GitHub Lifecycle

Apply this reference only in `publish-one` or `backlog` mode. Those modes require an explicit user request for GitHub publication or backlog processing.

## Repository and branch

- Use the same GitHub repository for the issue, branch publication, PR, labels, comments, and closure.
- Work in `$HOME/Sites/wappalyzer/extension` for definition changes.
- Do not assume its current `origin` is the issue repository. Inspect remotes and add or use the correct remote when necessary.
- Start from a clean, current target default branch; in this workspace it is normally `master`.
- Create a fresh `codex/...` branch for each accepted issue.
- Never combine accepted issues. Use one issue, branch, commit, and PR, even when changes are adjacent or touch the same JSON file.
- In backlog mode, finish the PR, label, comment, and closure for the current issue before starting another.

## Commit and PR

Use the same concise subject for the commit and PR title:

- `add <technology name>` for a new definition
- `update <technology name>` for detection, icon, or metadata changes

Validate with `yarn validate` in `$HOME/Sites/wappalyzer/extension` before committing.

The PR body must include:

- a concise summary
- the example websites used as evidence
- validation performed
- a reference to the original issue
- the fingerprint and metadata rationale
- meaningful issue-stub suggestions that were rejected or omitted, with reasons

End every PR body, PR comment, and issue comment posted under the user's account with this exact final line:

```text
— Codex
```

Prefer `--body-file` or a safely quoted here-document over inline shell strings. Do not thank or directly address the reporter; write concise project-facing resolution notes.

## Labels and mandatory closure

Query the target repository's live labels before editing the issue. Never use `Acknowledged`.

Every handled in-scope issue is commented on, given the most accurate label, and closed. Apply the comment and label before closing.

| Label | Use when | Required resolution note |
| --- | --- | --- |
| `Accepted` | A new PR was opened in this run | Link the PR, explain that it tracks the change, and state that the intake issue is being closed in favor of the PR |
| `Already added` | The requested definition or fix already exists and needs no PR | Point to the existing definition or completed work |
| `Fixed` | A concrete fix is already merged into the default branch or shipped | Link or identify the merged fix; never use this for unmerged work |
| `Works as intended` | Current behavior is correct or the report is not reproducible | State the verification result |
| `Won't fix` | The behavior is understood but intentionally unsupported or cannot be implemented safely | State the reason |
| `Not eligible` | Normal extension intake fails the support or eligibility bar | State the eligibility reason |
| `More info needed` | Investigation still has a concrete blocker | State exactly what information or usable evidence is missing, why it is required, and that a new issue can be opened with it |

Outside-scope issues and issues belonging to another repository or subsystem remain untouched: do not comment, label, or close them.

For `Accepted`, do not rely on automatic PR closure. After the PR exists, post the PR link and closing explanation, apply `Accepted`, and close the issue manually. For every other in-scope resolution, post the required note, apply the label, and close manually.

## Completion report

Make every issue and PR reference clickable. For a backlog, list each issue with its classification, resolution label, PR when present, and closure result.
