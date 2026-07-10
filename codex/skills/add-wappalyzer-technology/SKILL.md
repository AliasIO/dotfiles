---
name: add-wappalyzer-technology
description: Research, validate, add, or update Wappalyzer browser-extension technology definitions and icons in `extension/`. Use for technology eligibility, live-site evidence, false-positive analysis, fingerprints, metadata, categories, CPEs, pricing, icons, and local behavioral validation. An inspection request is read-only; “add”, “fix”, or “update” permits local implementation but never commit, push, PR, issue mutation, or deployment unless separately requested through the appropriate workflow.
---

# Add Wappalyzer Technology

## Authority

- Select Inspect for research, review, or diagnosis and do not edit files.
- Select Implement only when the user asks to add, fix, or update a definition. Limit work to local task-owned files and validation.
- Never commit, push, open a PR, mutate an issue, release, or deploy through this skill. Use the issue or publication workflow when explicitly requested.

## Load the right guidance

- Read the root and `extension/` scoped project `AGENTS.md` files before working. They own repository, consumer, schema, and runtime invariants.
- Read [repository.md](references/repository.md) for canonical paths, capture helpers, and validation.
- Read [eligibility.md](references/eligibility.md) before spending time on evidence.
- Read [detection-research.md](references/detection-research.md) for browser evidence and fingerprint design.
- Read [metadata-and-icons.md](references/metadata-and-icons.md) when metadata, pricing, categories, CPE, or an icon is in scope.

## Workflow

1. Confirm the product identity, canonical website, likely category, and requested outcome. Apply the eligibility gate; stop early with a reason if the candidate is out of scope.
2. Inspect the existing definition, related technologies, schema, README, validator, and relevant Git history in `extension/`.
3. Gather at least two independent positive implementations and one unrelated control. Target three to five positives and one or two controls when practical; cover materially different integration modes such as vendor-hosted and custom-domain deployments.
4. Capture each site in a real browser with a short post-load observation window. Raw HTTP evidence may support the analysis but cannot replace browser evidence for a detection change.
5. Compare captures, separate first-party host signals from third-party product signals, and select the narrowest repeatable evidence. Prefer complementary rules and a realistic path to confidence `100`.
6. In Implement mode, edit the canonical definition/icon files in `extension/`. Omit uncertain metadata rather than guessing.
7. Run schema validation, then re-run behavioral checks on every positive and control. Schema validation is necessary but is not a behavioral retest.
8. Report evidence, chosen fingerprints, controls, omissions, and uncertainty. If browser capture is unavailable or evidence remains ambiguous, stop without shipping a weak rule.

## Evidence baseline

- Apply the extension scoped first-party/third-party detection boundary before accepting any signal.
- Prefer product-specific JS globals, request hosts/XHR, script URLs/content, DOM, metadata, and headers. Use cookies cautiously and scope plugins/themes with dependency fields.
- Verify client versions as recognizable shipped software versions; do not expose API, schema, protocol, wrapper, or snippet versions as the technology version.
- Avoid generic globals, hosts, CDN markers, marketing links, and rules that match dynamic user/bootstrap text.
- For a browser-undetectable backend technology, prefer a safe `implies` relationship from an existing detectable technology over a weak standalone rule.

## Delivery

- Name the positive and control sites used.
- State which browser-observed fields support each rule and why they are specific.
- State whether all positives and controls were retested after the edit.
- List intentionally omitted fields such as `cpe`, `pricing`, or `icon` and explain uncertainty briefly.
