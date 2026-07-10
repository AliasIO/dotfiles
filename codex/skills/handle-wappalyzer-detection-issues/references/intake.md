# Detection Issue Intake

## Resolve the input

Prefer a direct issue URL, then `owner/repo` plus an issue number, then a narrow repository search. Infer the repository from the issue URL before using workspace defaults.

For one issue, read the full body and every comment before classifying it. Later comments can identify the product, add samples, or show that the report is already resolved. Treat the issue's JSON stub, suggested fingerprints, categories, icons, metadata, examples, and screenshots as leads rather than facts.

For a backlog request:

- Use `wappalyzer/wappalyzer` unless the user explicitly names another repository.
- List open issues oldest-first.
- Inspect them in that order and select the first in-scope actionable issue; common intake titles include `Issue: A technology is not being identified when it should` and `Technology suggestion: Name`.
- Default to handling one issue. Process multiple issues only when the user explicitly requests a batch or count.
- Finish the full lifecycle for one issue before moving to the next.

The strongest candidates identify a concrete product, vendor or sample URL, and a clear missing-detection, false-positive, or metadata problem. A polished submission is not evidence by itself; independently verify every material claim.

## GitHub access

Prefer authenticated `gh`. Otherwise use `GITHUB_TOKEN` or `GH_TOKEN` with the bundled `scripts/fetch_issues.mjs`. A read-only token needs issue and metadata read access; publishing also requires contents, issue, and pull-request write access to the target repository.

## Preliminary scope gate

Read `$HOME/Sites/wappalyzer/extension/README.md`, then load and apply the canonical eligibility, first-party evidence, category, and implication rules from `add-wappalyzer-technology`. Do not create a second issue-specific eligibility standard.

When a known technology is reportedly missing or misdetected, investigate the cited page first. Use a comparable public deployment only when that page is unreachable. If the technology is present but current detection misses it, classify it as `FIX` and attempt an improvement before resolving it without code. Gather the first round of browser evidence yourself; use `More info needed` only after a concrete blocker remains, such as dead samples, anti-bot lockout, or ambiguous product identity.

## Classification

- `ADD`: an eligible product is missing from the extension definitions.
- `FIX`: an existing definition is stale, too broad, false-positive, or misses current evidence.
- `META`: only the icon, website, description, category, or other metadata needs changing.
- `NOT_THIS_SKILL`: crawler/runtime behavior, extension UI, account, billing, AWS, Cognito, or another issue without a technology-definition target.

Search `$HOME/Sites/wappalyzer/extension/src/technologies/*.json` and recent history in the `extension/` repository before finalizing `ADD`, `FIX`, or `META`. The workspace root is not the extension Git repository. Do not edit checked-out extension submodule copies elsewhere in the workspace.

Outside-scope issues remain untouched even in publish modes. In-scope intake that is rejected on eligibility or evidence grounds is resolved through the labels in [github-lifecycle.md](./github-lifecycle.md).
