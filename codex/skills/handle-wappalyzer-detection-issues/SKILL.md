---
name: handle-wappalyzer-detection-issues
description: "Inspect, implement, publish, or batch-process GitHub issues about missing, broken, false-positive, or metadata-only Wappalyzer extension detections. Use for a specific issue URL or number, or when explicitly asked to action the detection backlog. Select the least-authorized mode: inspect only reads and classifies; implement makes and validates a local extension change; publish-one commits, pushes, opens one PR, then labels, comments on, and closes one in-scope issue; backlog repeats publish-one oldest-first only when the user explicitly requests a batch. Delegate technology-definition research to add-wappalyzer-technology."
---

# Handle Wappalyzer Detection Issues

Handle GitHub intake around browser-extension technology definitions without duplicating the detection-authoring rules owned by `add-wappalyzer-technology`.

## Select a mode

Choose the least-authorized mode supported by the user's request:

| Mode | Trigger | Allowed effects |
| --- | --- | --- |
| `inspect` | Review, summarize, classify, or choose an issue | Read GitHub and local files only |
| `implement` | Fix or implement a specific issue | Edit and validate local files in `extension/`; do not commit, push, open a PR, or mutate the issue |
| `publish-one` | Explicitly action or publish a specific issue, or explicitly open its PR | Implement; create one branch and commit; push; open one PR; label, comment on, and close that issue |
| `backlog` | Explicitly process or action multiple backlog issues | Repeat `publish-one` oldest-first, completing each issue before starting the next |

An issue URL alone authorizes `inspect`. Default to one issue unless the user explicitly requests a batch or count. If the request is ambiguous, stay in the less-authorized mode and report what remains.

## Required references

- Read [intake.md](./references/intake.md) before classifying an issue.
- Read [github-lifecycle.md](./references/github-lifecycle.md) completely before any `publish-one` or `backlog` action.
- Load and follow `add-wappalyzer-technology` before researching or editing a definition. That skill owns eligibility, live-site evidence, fingerprints, metadata, icons, and detection validation.

## Workflow

1. Resolve the issue repository from the URL or explicit user instruction. For backlog polling without another explicit repo, use `wappalyzer/wappalyzer`; do not substitute `AliasIO/wappalyzer`.
2. Fetch the full issue body and every comment. Prefer authenticated `gh`; use the bundled helper when a normalized payload or token fallback is useful.
3. Apply [intake.md](./references/intake.md) and classify the issue as `ADD`, `FIX`, `META`, or `NOT_THIS_SKILL`.
4. Stop after reporting the classification in `inspect` mode.
5. For `ADD`, `FIX`, or `META` in an implementation-capable mode, work in `$HOME/Sites/wappalyzer/extension`, load `add-wappalyzer-technology`, and validate the result with `yarn validate` there.
6. Stop with the validated local diff in `implement` mode.
7. In `publish-one` or `backlog`, follow [github-lifecycle.md](./references/github-lifecycle.md). Keep one accepted issue per branch, commit, and PR. Every handled in-scope issue must receive an appropriate non-`Acknowledged` label and be closed; outside-scope issues stay untouched.
8. Report every referenced issue and PR as a clickable Markdown link.

## Fetch helper

Fetch one issue with comments:

```bash
node "$HOME/Sites/dotfiles/codex/skills/handle-wappalyzer-detection-issues/scripts/fetch_issues.mjs" \
  --url https://github.com/wappalyzer/wappalyzer/issues/12345 \
  --comments \
  --pretty
```

List a narrow oldest-first candidate set with `gh`:

```bash
gh issue list \
  --repo wappalyzer/wappalyzer \
  --state open \
  --limit 20 \
  --search 'sort:created-asc' \
  --json number,title,createdAt,labels,url
```

## Delivery

State the selected mode and classification, what evidence or validation was used, and which local or remote actions were performed. Call out missing GitHub access before promising publish actions.
