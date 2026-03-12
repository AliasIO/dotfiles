# Project Instructions

## Canonical edit locations

- Make CLI/runtime/browser-behavior changes in `cli/`, especially `cli/index.js`.
- Make shared API logic changes in `v4/apis-shared/`, not in the `v4/apis/*/shared` submodules.
- Make browser extension technology-definition metadata changes in `extension/src/technologies/*.json`.
- Keep `extract/shared.js`, `extract/linkedin.js`, and `extract/diallingcodes.json` symlinked to `v4/apis-shared/`.
- Treat Wappalyzer detection logic as canonical in the upstream extension project (`extension/src/js/wappalyzer.js` there), not in the checked-out submodule copies in this workspace.

## Submodule policy

- Do not edit files inside these submodules directly:
  - `cli/wappalyzer`
  - `v4/apis/*/wappalyzer`
  - `v4/apis/*/shared`
  - `_other/utils/hints/wappalyzer`
- If a CLI change is pushed, update the parent repos by moving their submodule pointers instead of reapplying the code change in each location.
- Known parent repos that track the CLI submodule:
  - `v4/apis`
  - `_other/utils`
- In `v4/apis/run`, update first-level submodules with `git submodule update --remote`, then run a recursive non-remote update so nested submodules match the updated parent repos.

## Runtime constraints

- Keep `--single-process`; the crawler must continue to run in Lambda-compatible mode.
- HTML support was deprecated and removed. Do not reintroduce deprecated HTML-support code paths.
- The extension now uses `extension/src/manifest.json` as the single canonical Manifest V3 source for Chromium, Firefox, and Safari conversion.
- `lookup` and `crawl-async` stay container-based because they bundle the browser runtime; `ping` and `lookup-site` use Lambda handlers with the shared and dependencies layers.
- GeoIP is standardized on `geoip-lite`; non-container APIs that need local GeoIP data should attach the `dep-geoip` layer, while container builds and the dedicated `geoip` Lambda also use `geoip-lite`.
- For container API builds that install Puppeteer, set `PUPPETEER_SKIP_DOWNLOAD=true`; `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` alone is not enough for the current Puppeteer release used here.

## Cognito operations

- Cognito user pool and app client settings are managed in AWS, not as infrastructure code in this workspace. Repo changes here can update triggers and referenced IDs, but auth-flow, MFA, threat-protection, and app-client security changes must be made in Cognito directly.

## Maintenance

- When you learn a durable project-specific rule that is not obvious from the codebase or general context, update this `AGENTS.md` in the same turn.
- Keep additions short and practical. Prefer stable workflow/location rules over temporary debugging notes.
- Technology descriptions in `extension/src/technologies/*.json` should be neutral, factual, in American English, and no longer than 250 characters.
- Prefer specific technology descriptions over generic labels, and only add missing descriptions when the product and its function are clear.
- For new extension technology definitions, confirm fingerprints on multiple live sites when practical, prefer specific JS globals with fallback signals, avoid short or generic variables, and test unrelated control sites before shipping to reduce false positives.
- Treat `js` fingerprints as OR-based within a technology: any single matched chain can trigger detection, so only add fallback globals that are safe on their own.
- If two weak fingerprints are only reliable together, you can make them effectively AND-like by splitting confidence across them (for example `confidence: 50` on each) so both are needed to reach a positive result; use this sparingly and only when each rule is low-confidence alone but high-confidence together.
- For `core-js`, prefer `__core-js_shared__` as the direct client-side signal; treat bare `core` as a risky legacy global, and do not treat `_babelPolyfill` as `core-js`-unique because it is a Babel/@babel/polyfill marker.
- Before doing deep fingerprint research for a new extension technology, do a quick eligibility gate against the extension scope and user-value bar. If the product is obviously too small, stale, dead, or lacks an independent public footprint, stop early instead of spending more time trying to force a definition. If direct public-web detection is unrealistic but the technology fits an existing category cleanly, check whether it is still worth adding as an implied-only technology via an existing detectable definition before rejecting it outright.
- For brand-new extension technology definitions, do not rely on the vendor site alone when an independent live integration or customer site is available; use the vendor site to understand the product, then confirm the fingerprint on at least one real deployment before treating it as shippable evidence.
- For mainstream client-side frameworks and libraries, include at least one adjacent compat or lookalike control (for example, Preact when researching React) and check whether the current detection already covers the official vendor site before proposing a wholesale replacement.
- For hosted white-label products such as status pages, widgets, or embedded forms, test at least one custom-domain deployment when practical and prefer fingerprints that survive custom domains over vendor-host-only URL rules.
- For white-label or embedded SaaS products that can load from both vendor-hosted or CDN assets and customer-branded domains, test both public deployment modes when practical and prefer rule sets that cover each real integration mode.
- For new extension technology definitions, always try to capture a version when the public signal is client-side, especially for JavaScript libraries, but only when the value is clearly the shipped library or SDK version a user would recognize. Do not expose API, schema, protocol, snippet, or wrapper version fields as `version` unless you can verify they track the actual client software version. For server-side products, omit version rather than guessing when no public evidence exists.
- For new extension technology definitions, try to find a matching CPE, but only add `cpe` when you are highly confident it is correct.
- For new extension technology definitions, always check the product website for pricing information before setting `pricing`, especially when `saas` is true, and use `extension/README.md` to map `low`/`mid`/`high` plus any applicable `freemium`, `onetime`, `recurring`, `poa`, or `payg` flags. Base the cost band on the typical paid self-serve plan or average monthly price, not the highest enterprise tier unless that is the only clear paid option.
- For new extension technology definitions, use a real browser capture with a short post-load observation window so late XHR, async scripts, and DOM mutations are included; do not rely on raw HTTP-only evidence when browser capture is required.
- For new extension technology definitions, prefer transparent-background square brand-mark icons that remain legible at small sizes like `16x16`; avoid full logos with text when choosing `icon` assets.
- For new extension technology definitions, strongly prefer SVG icons. Search for a real SVG first, including the product site, upstream repo assets, and reputable brand sources such as `brandsoftheworld.com`, and extract the icon mark from a full logo SVG when needed to remove text.
- Always save extension icons in `extension/src/images/icons/`.
- Never wrap a raster image inside an SVG just to satisfy the icon format preference. If no real SVG is available, either draw a clean SVG based on the official raster mark, use a PNG, or omit the icon.
- Use PNG only as a last resort after real SVG and clean SVG redraw options are exhausted. If you fall back to PNG, keep it at `32x32` or smaller. Prefer an official square asset around `32x32`; if no better official candidate exists, `16x16` is acceptable.
- Treat cookies as relatively weak detection signals because `Set-Cookie` is not guaranteed to appear in every response or browsing path. Prefer stronger signals first and use cookies mainly as supporting evidence unless they are unusually specific and repeatable.
- For client-side SaaS products, inspect runtime network activity early in real browser captures and prefer clean, repeatable vendor-specific `xhr` or request-host signals over bundle-text or cookie-based fingerprints when they are more specific.
- When an inline bootstrap snippet points to likely runtime globals or methods, verify them in a real browser before promoting them to `js` fingerprints; bootstrap code can expose placeholders that are not the final runtime API.
- Compare sample captures early enough to notice when a product appears through multiple integration modes, and draft coverage for more than one non-cookie signal before falling back to cookies as the bridge between those modes.
- Distinguish direct-detection candidates from implied-only backend candidates early. For server-side products that fit the taxonomy but are rarely exposed directly, prefer finding an existing detectable technology that can safely add them to `implies` over forcing a weak standalone fingerprint.
- When adding an implied-only backend technology, check more than one existing detectable technology for safe `implies` relationships instead of stopping at the first plausible candidate.
- For broad foundational technologies such as programming languages and databases, prefer a conservative direct fingerprint and do a follow-up pass on existing related technologies to add safe `implies` relationships where relevant.
- Verify the canonical product website and public pricing posture early in research so metadata decisions keep up with the detection work.
- For ubiquitous products such as payment methods, actively find positive samples from more than one platform or integration family before drafting a broad definition so a single wrapper does not masquerade as the product itself.
- Distinguish product signals from platform-wrapper signals. If the evidence is mostly a Shopify, WooCommerce, or other platform-specific wrapper, either scope the detection appropriately or keep the definition conservative instead of presenting it as a generic product fingerprint.
- Treat `saas` and `cpe` especially conservatively for payment processors, infrastructure-like services, and broad web primitives; omit them unless the public evidence clearly supports the generic product-level classification.
- For extension changelog requests, use `extension` Git history between the latest two `Build vX.X.X` commits (ignore newer HEAD commits), filter to non-merge detection subjects, drop `/ <category>` suffixes, dedupe repeated technologies, map `Add` to `ADD` plus both `Update`/`Fix` to `FIX`, and format each line exactly as `* \`ADD\` Name detection` or `* \`FIX\` Name detection`.
- Do not assume the workspace root is a Git checkout; inspect `extension/`, `cli/`, or `extract/` when you need remotes, history, or branch state.
- For Salesforce integration support, note that newer Salesforce orgs create new third-party apps under External Client App Manager; existing Connected Apps still work, and new Wappalyzer setups must match our non-PKCE authorization-code flow.
- For `v4/frontend` production deploys, push the frontend Git repo and let its GitHub Actions workflow handle deployment instead of running the manual website deploy script locally.
- For `v4/frontend`, default deploys should rebuild the technology pages; use a quick deploy only as an explicit exception when fixing an isolated issue.
- Treat GitHub suggestion tickets as user-submitted leads from the Wappalyzer website; verify the stub and all details independently, gate additions against `extension/README.md`, and reject tiny low-value technologies that are unlikely to help the broader user base.
- Reject new technology suggestions that do not fit an existing category cleanly enough to classify without forcing a poor match, and reject agencies, managed services, or bespoke company-built solutions that are not real software products.
- Reject purely server-side APIs, on-prem software, and similar products with no plausible public-facing website integration to fingerprint; products such as CRMs are only acceptable when they expose reliable public web signals like widgets, embeds, or managed pages.
- When working the Wappalyzer GitHub issue queue, start with the oldest actionable tickets first; the main extension-intake templates are technology bug reports and `Technology suggestion` tickets.
- For actioned Wappalyzer GitHub tickets, use the same GitHub repo for the issue, labels, closure, and PR; read comments first, then apply the appropriate non-`Acknowledged` label and close the issue after the PR is open.
- For technology categories, strongly prefer one primary category; add a second only when the classification is genuinely balanced across two categories.
- For `dom` detections, use the simple selector-string form for existence checks and reserve object notation for `attributes`, `properties`, or `text` matching.
- Do not add new `html` detections for extension technologies. `html` is deprecated; use `dom` instead.
