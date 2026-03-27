---
name: github-wappalyzer-issues
description: Review GitHub issues that describe missing, broken, or false-positive Wappalyzer detections and turn them into local technology-definition changes. Use when Codex is given a GitHub issue URL, issue number, repo issue queue, or a request to pick an actionable issue and add or fix a technology definition in the Wappalyzer extension.
---

# GitHub Wappalyzer Issues

## Overview

Use this skill when the work starts from GitHub issue intake rather than from a named technology alone. Resolve the issue scope, decide whether it maps to add-or-fix detection work, then hand off the actual definition research and editing to the existing `add-wappalyzer-technology` skill.

## Inputs

Prefer one of these entry points:
- A full GitHub issue URL
- `owner/repo` plus an issue number
- `owner/repo` plus a search string or labels for open issues

Treat every issue as user-submitted intake from the Wappalyzer website. The JSON stub at the top, any suggested fingerprints, category choices, icons, examples, and other issue details are suggestions only. Use them as leads, not as accepted facts, and verify every material claim before acting on the ticket.

When working a queue rather than a specific issue, start with the oldest actionable tickets first. The common issue types are:
- `Issue: A technology is not being identified when it should`
- `Technology suggestion: Name`

If the repo is not explicit, infer it from the issue URL first. In this workspace, do not assume `/Users/elbert/Sites/wappalyzer` is a git repo. Inspect the real git roots inside `extension/`, `cli/`, or `extract/` if repo inference is needed.

GitHub access:
- Prefer `gh` when it is installed and authenticated.
- Otherwise use `GITHUB_TOKEN` or `GH_TOKEN` with `scripts/fetch_issues.mjs`.
- For private repos, use a token that can read issues and repository metadata.

Read [issue-workflow.md](./references/issue-workflow.md) before fetching live issues if the task scope is broad.

## Workflow

1. Resolve the repo and issue scope.
2. Fetch either one issue or a small list of candidate issues, ordered oldest-first when you are choosing from a queue.
3. Read `/Users/elbert/Sites/wappalyzer/extension/README.md` and confirm the ticket belongs in the extension's published technology scope before accepting it as work.
4. Reject low-value suggestions early. Do not add tiny utility libraries, one-off jQuery plugins, or similarly marginal technologies just because a user filed a ticket. Prefer technologies that are significant enough to be useful to Wappalyzer's roughly 3 million weekly active users. Also reject products that do not fit an existing category cleanly enough to classify without forcing them into the wrong bucket, and reject purely server-side or on-prem solutions when they have no plausible public-facing web integration to fingerprint. If the product is obviously stale, dead, niche, single-purpose, or lacks an independent public footprint, stop there before deep fingerprint research even when sample sites or plausible fingerprints were submitted. A server-side product that fits the taxonomy cleanly can still be acceptable as an implied-only technology if an existing detectable definition can safely add it to `implies`.
5. For `Issue: A technology is not being identified when it should`, verify the claim on the exact provided website first (or a comparable public fallback only if the provided site is unreachable). If the technology is genuinely present but not detected, treat it as a `FIX` candidate and attempt to improve the fingerprint before considering closure. Only use `More info needed` after this verification attempt still leaves a concrete blocker.
6. Classify each issue before editing:
   - `ADD`: missing technology definition
   - `FIX`: broken or overly broad detection
   - `META`: icon or metadata-only update
   - `NOT_THIS_SKILL`: crawler/runtime bugs, auth issues, billing, unsupported product requests, or issues with no identifiable technology target
7. Choose categories conservatively. Prefer one primary category. Use a second category only when the product genuinely fits two equally defensible classifications, such as a technology that is as clearly a CMS as it is a blog platform.
8. Prefer the shortest supported detection syntax. For `dom` existence checks, use a plain selector string such as `"meta#foo, meta#bar"` instead of the expanded object form. Use the object form only when you need `attributes`, `properties`, or `text`. Do not add new `html` detections; `html` is deprecated, so express the signal through `dom` instead.
9. Stop if the issue is ambiguous, too small to justify support, unsupported by the README scope, not actually a software product, or obviously lacks a public-web detection path. Agencies, service providers, and bespoke company-built sites or solutions are not acceptable technology additions.
10. Check whether the technology already exists in `extension/src/technologies/*.json` and scan recent history in `extension/` for related work.
11. Load the `add-wappalyzer-technology` skill and follow its browser-evidence workflow for the actual detection change. Treat cookie fingerprints as weaker than `js`, `scriptSrc`, `dom`, `meta`, `headers`, or `xhr` because `Set-Cookie` is not guaranteed on every response path, and for client-side SaaS products inspect runtime network activity early so clean vendor-specific `xhr` or request-host signals can beat weaker bundle-text or cookie evidence. Compare captures early enough to notice multiple integration modes, and do not let cookies become the only bridge between those modes when a second non-cookie signal can be found. For white-label or embedded SaaS products, make sure the research covers both vendor-hosted or CDN and customer-branded deployment modes when those are both public. For ubiquitous products such as payment methods, make sure the positive samples are not all from the same platform family, and distinguish product signals from wrapper signals before presenting the result as a generic technology fingerprint. When inline bootstrap code suggests likely globals or methods, verify them in a real browser before using them as `js` fingerprints. If a technology fits the taxonomy but does not have a realistic standalone browser fingerprint, check for safe `implies` paths from existing detectable technologies before rejecting it, not just the first plausible candidate. When extracting a client-side `version`, prefer a recognizable shipped library or SDK version; do not surface API, schema, protocol, snippet, or wrapper version fields unless they are verified to track the actual client software version. Do not accept raster-inside-SVG icon shortcuts or redraw a new SVG from a raster source. Use a real SVG, edit an existing SVG when needed to remove a word mark or fix padding/clipping, use a PNG, or omit the icon; if you must use PNG, prefer an official square candidate around `32x32`, with `16x16` acceptable as a fallback. When setting `pricing`, use the README's typical-plan rule rather than letting a visible enterprise tier push the product into a higher pricing band.
12. Validate the resulting extension change with `yarn validate` in `/Users/elbert/Sites/wappalyzer/extension`.
13. Mention the issue URL or number in the final summary. Do not post comments, close issues, or change labels unless the user explicitly asks.
14. If the user explicitly asks for GitHub-side actions such as opening a PR or posting issue comments, end every PR body, issue comment, and PR comment with `— Codex` because the text is being posted under the user's account.

## Picking Issues

Prioritize issues that include:
- A concrete product name
- A vendor site or sample site URL
- A clear missing-detection or false-positive report
- Enough detail to decide whether the work belongs in `extension/`
- A technology that appears significant enough to matter to the wider Wappalyzer user base

Deprioritize or reject issues that are really about:
- CLI crawler behavior, Lambda constraints, or browser/runtime failures
- AWS, Cognito, billing, or account operations
- Requests with no product homepage or no plausible fingerprint source
- Work that belongs in a different repo than the extension definitions
- Tiny utility libraries, narrow one-off plugins, or other low-signal additions that are unlikely to be useful at Wappalyzer's scale
- Products that do not fit an existing category cleanly enough to classify without forcing a poor match
- Agencies, consultancies, managed services, or bespoke solutions that are not real software products
- Purely server-side APIs, on-prem software, or similar products with no plausible public-facing website integration to fingerprint
- Tickets whose website-submitted stub looks polished but cannot be independently verified

## Workspace Repo Mapping

Use the repo that matches the code you expect to edit:
- `extension/` currently tracks `AliasIO/wappalyzer`
- `cli/` currently tracks `wappalyzer/cli`
- `extract/` currently tracks `wappalyzer/extract`

If a GitHub issue points to extension detection logic, work in `extension/` and not in the checked-out submodule copies elsewhere in the workspace.

## Commands

List likely detection issues:

```bash
node /Users/elbert/.codex/skills/github-wappalyzer-issues/scripts/fetch_issues.mjs \
  --repo AliasIO/wappalyzer \
  --search "detection false positive not detected technology" \
  --state open \
  --limit 20
```

Fetch one explicit issue:

```bash
node /Users/elbert/.codex/skills/github-wappalyzer-issues/scripts/fetch_issues.mjs \
  --url https://github.com/AliasIO/wappalyzer/issues/12345 \
  --comments
```

Validate argument parsing without a network call:

```bash
node /Users/elbert/.codex/skills/github-wappalyzer-issues/scripts/fetch_issues.mjs \
  --url https://github.com/AliasIO/wappalyzer/issues/12345 \
  --dry-run
```

## Delivery

When you finish:
- Cite the issue URL or issue number you acted on.
- State whether the issue mapped to `ADD`, `FIX`, `META`, or a blocker.
- Summarize which evidence path was used once the `add-wappalyzer-technology` workflow starts.
- Call out missing access up front if `gh` is unavailable and no GitHub token is present.
