# Queue Workflow

## Repo Map

- Issues, labels, closure, and PRs: use the same GitHub repo for the current run
- Code changes: `/Users/elbert/Sites/wappalyzer/extension`
- Branch names: start with `codex/`

Infer the target repo from the issue URL or the user's explicit repo instruction, then use that same repo for issue operations and `gh pr create`. If the local `extension/` checkout points at a different remote, add or use a remote that can open the PR in the issue repo instead of assuming the current `origin` is correct.

## Oldest-First Intake

List open issues oldest-first:

```bash
gh issue list \
  --repo owner/repo \
  --state open \
  --limit 100 \
  --search 'sort:created-asc' \
  --json number,title,createdAt,labels,url
```

Read one issue with comments:

```bash
gh issue view 12345 \
  --repo owner/repo \
  --json number,title,body,comments,labels,state,url,createdAt,author
```

Or use the normalized local helper:

```bash
node /Users/elbert/Sites/dotfiles/codex/skills/github-wappalyzer-issues/scripts/fetch_issues.mjs \
  --url https://github.com/owner/repo/issues/12345 \
  --comments \
  --pretty
```

Read comments before classifying the ticket. Later comments can narrow the product name, add example sites, or show that the report was already resolved.

When a reporter says a known technology is missing or misdetected on a live site, investigate that claim on the cited page first, and only use a comparable public deployment when the provided page is unreachable. If the technology is present but not detected, attempt a fingerprint improvement before classifying the ticket for closure. The submitter is not responsible for providing the first round of DOM/script/runtime evidence when you can gather it yourself.

## Action Gate

Action a ticket only when it cleanly maps to one of these outcomes:

- `add <technology name>`: new technology definition
- `update <technology name>`: detection, metadata, or icon update for an existing definition

Leave the ticket untouched when it is:

- Outside extension detection scope
- Better handled in `cli/` or another repo
- Too small, stale, ambiguous, or low-value to justify support
- A tiny single-purpose library/component/plugin with limited independent detection value
- Not a real software product
- A pure server-side or on-prem product with no plausible public-web fingerprint

Single-purpose products are not automatically rejected: substantial single-purpose technologies (for example major CDNs, live chat platforms, or scheduling products) are still eligible when they show broad independent adoption and reliable website-facing fingerprints.

Treat metadata-only technology-definition edits as `update <technology name>`.

## Branch, Commit, and PR

Create a fresh branch in `extension/`:

```bash
git -C /Users/elbert/Sites/wappalyzer/extension switch -c codex/update-technology-name-12345
```

Keep the user-requested subject format exact:

- `add <technology name>`
- `update <technology name>`

Use that subject for the commit and the PR title unless there is a strong reason to differ.

Validate before opening the PR:

```bash
cd /Users/elbert/Sites/wappalyzer/extension
yarn validate
```

Push and open the PR in the same repo as the issue:

```bash
git -C /Users/elbert/Sites/wappalyzer/extension push -u origin HEAD
gh pr create \
  --repo owner/repo \
  --base master \
  --title 'update <technology name>' \
  --body-file /tmp/wappalyzer-pr.md
```

Suggested PR body:

```markdown
## Summary
- Updated `<technology name>` detection in the extension definitions.

## Example Sites
- https://example-one.test
- https://example-two.test

## Validation
- `yarn validate`

## Issue
- References owner/repo#12345

— Codex
```

In actioned ticket PRs, also explain why each fingerprint and metadata choice was made from the gathered evidence, and call out any meaningful issue-stub suggestions you intentionally rejected or omitted (for example `implies`, categories, metadata, or weaker fingerprints) with a short reason.

Do not rely on the PR to close the issue automatically. Label and close the issue manually after the PR exists.

## Labels and Closure

List labels live before choosing one:

```bash
gh label list --repo owner/repo
```

Common mappings:

- `Accepted`: a new PR now tracks the work
- `Already added`: the requested technology or fix already exists, so no new PR is needed
- `Fixed`: the default branch already contains the needed correction, so no new PR is needed
- `Not eligible`: the ticket was reviewed as normal extension intake but does not meet the support bar
- `More info needed`: the ticket could be actionable later, but only after you investigated it yourself and still hit a concrete blocker that leaves too little reliable detail to proceed

Do not use `Acknowledged`.

If the outcome is anything other than `Accepted`, leave a short issue comment first that explains the reason for closure. For `More info needed`, name the concrete blocker you hit after investigating. Every GitHub issue comment, PR comment, and PR body you post under the user's account must end with `— Codex`.

Prefer `gh issue comment --body-file /tmp/comment.md` or a quoted here-doc for comment bodies so apostrophes, backticks, and markdown survive shell parsing.

Apply the label before closing:

```bash
gh issue edit 12345 --repo owner/repo --add-label 'Accepted'
gh issue close 12345 --repo owner/repo
```

If the ticket is normal extension intake but is rejected as `Not eligible` or `More info needed`, apply that label and close it. Use `More info needed` only after a reasonable investigation still leaves a concrete blocker. Leave the ticket untouched only when it is truly outside scope or belongs in another repo.
