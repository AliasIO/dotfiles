# Detection Research

## Evidence set

- Prefer live production surfaces. Use checkout, form, status, or other deeper flows when the integration appears there rather than on the homepage.
- For widely wrapped products, sample more than one platform/integration family. For white-label products, include custom-domain and vendor-hosted/CDN modes when available.
- Observe briefly after load for delayed requests, scripts, and DOM changes.

## Signal order

1. Product-specific `js` globals, ideally with a verified shipped version.
2. Product-specific request hosts or XHR.
3. Product-specific script URLs/content, DOM, metadata, or headers.
4. Distinctive cookies when stronger signals cannot cover the integration modes.
5. `requires`, `requiresCategory`, or `implies` for scoped/indirect relationships.

Use two or three complementary rules when they improve coverage without weakening specificity. When confidence is split, ensure true positives can realistically reach `100` through independent matches.

## First-party boundary

- Apply the canonical boundary from the extension scoped `AGENTS.md`; the examples here only illustrate it.
- A Sentry request identifying `sentry.javascript.vue` supports Sentry, not Vue.js on the host page, unless independent first-party DOM, globals, scripts, or assets show Vue.
- Separate the product signal from platform-wrapper signals. Scope the rule or remain conservative when evidence mostly identifies a wrapper.
- Prefer safe implication for a backend technology with no realistic browser fingerprint.

## Versions

- Extract only a version users would recognize as the shipped client library or SDK.
- Do not use API, schema, protocol, snippet, or wrapper versions without proof they track the product release.
- For `scriptSrc`, a bare `/<semver>/file.js` is insufficient unless adjacent path segments identify the product.
- Omit version detection for server-side products when public evidence is absent.

## False-positive controls

- Avoid short/generic globals, browser built-ins, generic configuration keys, broad vendor/CDN hosts, marketing links/logos, and bare iframe/link host selectors.
- Remember that each `js` chain can independently trigger a technology; a generic fallback is not made safe by a stronger sibling rule.
- Do not use marker-only `scripts` expressions that dynamic search, chat, bootstrap, or user content can echo.
- Verify inline-bootstrap globals in a real browser before relying on them.
- Retest every positive and control after editing. Stop when a signal remains ambiguous.
