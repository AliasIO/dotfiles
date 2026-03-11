# Research Checklist

## Evidence standard

- Use a real browser environment for capture. Raw HTTP responses are useful for supporting context but are not enough on their own for definition research.
- Confirm the fingerprint across a small number of live sites when practical.
- Prefer real production sites over directory listings.
- Do a quick eligibility pass before deep research. If the product is clearly out of scope, too small to matter, stale, dead, or lacks an independent public footprint, stop early instead of trying to force a shippable definition. If it fits the taxonomy but direct public-web detection is unrealistic, check whether it belongs as an implied-only technology through an existing detectable definition.
- If you need more samples, check the product site for showcases, customers, examples, or demos, then fall back to BuiltWith-style directories or search results.
- Prefer homepage detection, but use the real product surface when the technology only appears deeper in the flow.
- For ubiquitous products such as payment methods, include positive samples from more than one platform or integration family when practical so a single wrapper does not define the detection.
- For hosted white-label products such as status pages, widgets, and embeds, include at least one custom-domain deployment when practical so the fingerprint is not limited to the vendor-hosted domain.
- If a white-label or embedded product can load through both vendor-hosted or CDN assets and customer-branded domains, try to capture at least one sample of each public deployment mode.
- Observe each page for a short post-load window so delayed XHR, async scripts, and DOM mutations have time to appear.
- Verify the canonical product website and public pricing posture early so metadata keeps pace with the detection research.

## Fingerprint preferences

1. Favor product-specific `js` globals, especially when they expose a recognizable shipped library or SDK version.
2. Add 2-3 complementary rules when practical so detection still works if one signal disappears.
3. Compare captures early enough to notice when different samples use different integration modes, and prefer a rule set that covers more than one non-cookie signal before relying on cookies to bridge those modes.
4. For client-side SaaS products, inspect runtime network activity early and favor clean, repeatable vendor-specific `xhr` or request-host signals over bundle-text or cookies when they are more specific.
5. Distinguish product signals from platform-wrapper signals, and scope the detection or keep it conservative when the evidence mostly reflects the wrapper.
6. If inline bootstrap code points to likely globals or methods, verify them in a real browser before relying on them as `js` fingerprints.
7. Distinguish direct-detection candidates from implied-only backend candidates early. When a server-side product fits a category but lacks a realistic browser fingerprint, prefer a safe `implies` path from existing detectable technologies over a weak standalone rule, and check more than one plausible implying technology when practical.
8. Use `requires` or `requiresCategory` to scope plugins, themes, and platform-specific integrations.
9. Favor vendor-owned hosts or paths that clearly identify the product.
10. Do not add new `html` detections for extension technologies. `html` is deprecated; use `dom` instead.

## False-positive rules

- Avoid short or generic `js` variables.
- Avoid browser-built-ins and common framework globals.
- Avoid generic words like `ecommerce`, `tracking`, `widget`, or `version`.
- Do not treat API, schema, protocol, snippet, or wrapper version fields as `version` unless you can verify they map to the actual client software version users would expect to see.
- Avoid generic third-party hosts unless they are unique to the product.
- Test on unrelated control sites before shipping.
- If the signal still feels ambiguous after testing, do not add the detection.
- If browser capture is broken on the machine, report that blocker instead of relying on raw HTTP-only evidence.

## Metadata rules

- `cpe`: only when high confidence; otherwise omit.
- `description`: neutral, factual, American English, less than 250 characters.
- `saas`, `oss`, `pricing`: infer conservatively from public evidence; omit if unclear.
- Treat `saas` and `cpe` especially conservatively for payment processors, infrastructure-like services, and broad web primitives; omit them unless the generic product-level classification is clearly supported.
- `website`: use the canonical product page or vendor homepage for the product.
- `icon`: strongly prefer a transparent-background square SVG brand mark from the product site or official brand materials; if needed, search other reputable brand sources such as `brandsoftheworld.com`, extract the mark from a full logo SVG when the source includes text, fall back to PNG only if necessary, and omit if no suitable file exists.

## Suggested site-testing pattern

For each candidate definition:

1. Capture 2-3 sample sites.
2. Capture 1-2 unrelated control sites.
3. Observe each capture briefly after page load to collect late XHR, async scripts, and DOM updates.
4. Compare the captures.
5. Choose the narrowest signal that appears on the samples but not the controls.
6. Validate the definition.
7. Re-run the sample and control captures if anything still looks broad.

## Good delivery notes

Record:
- Which sample sites were used.
- Which control sites were used.
- Which fields were chosen for detection.
- Which fields were intentionally omitted.
- Any remaining uncertainty, especially around `cpe` or overly broad vendor hosts.
