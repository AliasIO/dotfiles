# GitHub Issue Workflow

## Inputs to gather

Prefer these in order:
- A direct issue URL
- `owner/repo` and issue number
- `owner/repo` and a narrow search query

Treat the issue body as user-supplied intake from the Wappalyzer website. The top JSON stub, suggested examples, fingerprints, categories, and metadata are not authoritative. Verify them against live evidence and the repository criteria before accepting the issue as work.

If choosing from a backlog, start with the oldest actionable issue first. In practice, most relevant tickets will be either:
- `Issue: A technology is not being identified when it should`
- `Technology suggestion: Name`

If none are provided, ask for the repo or inspect the relevant git checkout to infer it. In this workspace, the top-level `wappalyzer/` folder is not itself the git repo for the extension.

## GitHub access

Use one of these:
- `gh` installed and authenticated
- `GITHUB_TOKEN`
- `GH_TOKEN`

For private repos, prefer a fine-grained token scoped to the target repo with:
- `Issues: Read`
- `Metadata: Read`

If future work should comment on or close issues, add `Issues: Read and write`. For public repos, unauthenticated access may work for a few requests, but expect low rate limits.

If you post a PR body, issue comment, or PR comment under the user's GitHub account, always end it with `— Codex` so the authorship is explicit. When writing issue comments, treat them as internal triage notes rather than replies to the submitter: no thank-yous, no direct address, just the reason for the label or action.

## Actionability rubric

Before classifying an issue, read `/Users/elbert/Sites/wappalyzer/extension/README.md` and confirm the suggestion fits the extension's scope. Then apply a significance filter: do not spend time adding tiny utility libraries, UI components, niche one-off plugins, or similarly low-value technologies that are unlikely to help Wappalyzer's roughly 3 million weekly active users. Single-purpose alone is not a rejection reason; substantial single-purpose products such as broadly deployed CDNs, live chat platforms, or scheduling products remain in scope when they provide strong independent detection value.

When a user reports that a named technology is missing or misdetected on a live site, investigate that claim on the cited page first. Use a comparable public deployment only if the provided site is unreachable. If the technology is present on that site but current detection misses it, treat the issue as `FIX` and attempt a fingerprint improvement before deciding to close it. The burden for the first pass of DOM/script/runtime evidence gathering does not lie with the submitter. A later `More info needed` decision is appropriate only if that investigation and fix attempt still leave a concrete blocker such as dead sample URLs, anti-bot interstitials, or ambiguous product identity.

Reject purely server-side APIs, on-prem products, and similar software with no plausible public-facing website integration to fingerprint. Some products that are mainly back-office systems, such as CRMs, can still be valid when they expose public live chat widgets, embedded forms, or CMS-managed pages that produce reliable website signals.

When choosing categories, prefer a single primary category. Add a second only when the product truly belongs in two categories of equal weight. Do not spread a technology across multiple adjacent categories just because the marketing copy mentions several features. If a product does not fit an existing category cleanly enough to classify without forcing a poor match, reject it instead of misclassifying it.

When drafting `dom` detections, use the concise selector-string form for simple existence checks. Only use the expanded object syntax when you need to match attributes, properties, or text content. Do not add new `html` detections for extension technologies; `html` is deprecated, so use `dom` instead.

Map issues like this:
- `ADD`: the product is real, can be identified, and appears missing from the extension definitions
- `FIX`: the product exists in the definitions but the fingerprint is stale, too broad, or missing current signals
- `META`: the issue is only about icon, website, description, or similar metadata
- `NOT_THIS_SKILL`: the report is about crawler runtime, Chrome extension UI behavior, billing, account setup, AWS, Cognito, or non-detection product bugs

Stop and report the blocker if:
- The product name is unclear
- No vendor or sample URL is available
- The issue asks for behavior outside technology detection
- The likely change belongs in `cli/` rather than `extension/`
- The suggestion is too minor to justify support at Wappalyzer's user scale
- The suggestion is really an agency, service provider, or bespoke company-built solution rather than a software product
- The product is purely server-side or on-prem and has no realistic public-web integration to detect
- The issue content cannot be independently verified even if the stub looks complete

## Suggested search terms

Use narrow search strings before broader sweeps:
- `not detected`
- `false positive`
- `wrong detection`
- `technology`
- `fingerprint`
- `icon`

Combine them with repo context instead of scanning the whole issue tracker.

## Handoff to detection work

Once an issue is classified as `ADD`, `FIX`, or `META` for extension detection:
1. Search `extension/src/technologies/*.json` for the technology name and likely aliases.
2. Check recent history in `/Users/elbert/Sites/wappalyzer/extension`.
3. Load the `add-wappalyzer-technology` skill.
4. Follow its real-browser evidence capture workflow. Treat cookie fingerprints as relatively weak unless they are unusually specific and repeatable, because `Set-Cookie` is not guaranteed on every response path. For client-side SaaS products, inspect runtime network activity early and prefer clean vendor-specific `xhr` or request-host signals over weaker bundle-text or cookie evidence when they are more repeatable. Compare captures early enough to spot multiple integration modes, and avoid using cookies as the only bridge between those modes when another non-cookie signal is available. If the product is white-label or embedded and can appear through both vendor-hosted or CDN assets and customer-branded domains, capture both public deployment modes when practical. For ubiquitous products such as payment methods, confirm the positive samples are not all from the same platform family and separate product signals from wrapper signals before treating the result as a broad technology fingerprint. When inline bootstrap code points to likely globals or methods, verify them in a real browser before using them as `js` fingerprints. If the technology fits the taxonomy but does not have a realistic standalone browser fingerprint, check for safe `implies` paths from existing detectable technologies before rejecting it, not just the first plausible candidate. Never wrap a raster image inside an SVG for icon work; use a real SVG, a clean SVG redraw based on the official raster mark, a PNG, or omit the icon. If PNG is the fallback, prefer an official square candidate around `32x32`, with `16x16` acceptable when nothing better is available. When setting `pricing`, use the typical paid self-serve plan or average monthly price from the README guidance instead of classifying by the highest visible enterprise tier.
5. Validate with `yarn validate` in `/Users/elbert/Sites/wappalyzer/extension`.

Do not skip the browser evidence step just because the issue contains screenshots or copied HTML.
