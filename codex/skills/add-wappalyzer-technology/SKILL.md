---
name: add-wappalyzer-technology
description: Research, validate, and add or update Wappalyzer browser-extension technology definitions and icons in the split extension repo. Use when Codex must find live example sites, capture browser evidence, choose low-false-positive fingerprints, add metadata or CPE fields, or verify a detection before editing extension/src/technologies/*.json.
---

# Add Wappalyzer Technology

Use this skill when asked to add or fix a technology definition for the Wappalyzer browser extension.

Require a real browser capture for definition research. Do not treat raw HTTP fetches as sufficient evidence when the goal is to choose or validate fingerprints.

Start in the real repo locations:
- Edit definitions in `extension/src/technologies/*.json`.
- Add icons in `extension/src/images/icons/`.
- Read schema and validation rules from `extension/schema.json` and `extension/bin/validate.js`.
- Read Git history from the `extension/` checkout, not the workspace root.
- Use the local crawler in `cli/` for browser evidence capture. Keep its `--single-process` behavior intact.

Read these references before making changes:
- `references/repo-guide.md` for file locations, validation commands, and Git-history patterns.
- `references/research-checklist.md` for evidence standards, fingerprint preferences, metadata rules, and false-positive checks.

## Workflow

1. Confirm the target technology name, canonical product website, likely category, and rough pricing posture when public. Before doing deeper research, gate the technology against the extension scope and value bar. If it is clearly too small, stale, dead, or lacks a plausible independent public footprint, stop early and report that instead of forcing a definition. If direct public-web detection is unrealistic but the technology fits an existing category cleanly, check whether it is still worth adding as an implied-only technology through an existing detectable definition.
2. Find 3-5 live sample sites when practical. Prefer real production homepages, but use product-specific flows such as checkout pages when that is where the signal exists. For ubiquitous products such as payment methods, try to include more than one platform or integration family so a single wrapper does not dominate the draft.
   If the product is a hosted white-label surface such as a status page, widget, or embedded form, include at least one custom-domain deployment when practical so you do not overfit to the vendor-hosted domain. If it can also load from a vendor CDN or vendor-hosted subdomain, try to include one sample of that mode too.
3. Find at least 1-2 unrelated control sites to test for false positives.
4. Capture evidence for each sample and control site with `scripts/capture-evidence.js` in a real browser environment.
5. Keep a short post-load observation window so late XHR, async scripts, and DOM mutations are included in the evidence.
6. Compare the captures manually or with `scripts/compare-captures.js` to identify sample-only signals. Do this early enough to notice when different samples expose different integration modes. For client-side SaaS products, inspect runtime network activity early and prefer vendor-specific `xhr` or request-host signals when they are cleaner and more repeatable than bundle-text or cookies. When inline bootstrap code suggests likely globals or methods, verify them in a real browser before using them as `js` fingerprints.
7. Choose 2-3 complementary fingerprints when possible, with the strongest rule first. If the product shows up through multiple integration modes, try to cover at least two non-cookie signals before treating cookies as the bridge between them. Distinguish product signals from platform-wrapper signals, and either scope the detection or keep it conservative when the public evidence mostly reflects a wrapper. If the technology is a valid server-side or backend concept but does not have a realistic standalone browser fingerprint, look for existing detectable technologies that can safely add it to `implies` instead of forcing a weak direct rule, and check more than one plausible implying technology when practical. Always try to extract a version when the technology is client-side and the public signal supports it, especially for JavaScript libraries, but only use values that clearly represent the shipped library or SDK version a user would recognize. Treat API, schema, protocol, snippet, and wrapper version fields as non-version metadata unless you can verify they track the actual client software version. Also try to find a matching CPE, but only add `cpe` when you are highly confident it is correct.
8. Add or update the definition, icon, and metadata in `extension/`.
9. Validate with `yarn validate` in `extension/`.
10. Re-test the sample and control sites. If you are not confident in the fingerprint, say so instead of shipping it.

## Evidence Priorities

Prefer these signals in roughly this order:
1. Product-specific `js` globals, ideally with a version.
2. Product-specific request hosts or `xhr`, especially for client-side SaaS products.
3. Product-specific `scriptSrc`, `scripts`, `dom`, `meta`, or `headers`.
4. Product-specific `cookies` only when they are unusually distinctive and repeatable across samples; treat them as relatively weak because `Set-Cookie` is not guaranteed to appear on every response or browsing path.
5. `requires` or `requiresCategory` when the technology is scoped to a platform such as a WordPress plugin or Shopify app.

Avoid:
- Very short `js` globals such as 2-3 character names unless there is strong supporting evidence and no realistic false-positive risk.
- Generic names like `ecommerce`, `config`, `version`, or browser-built-ins.
- Generic CDN or vendor hosts unless the pattern is clearly unique to the technology.
- New `html` detections. `html` is deprecated for extension definitions; use `dom` instead.
- Assuming a version can be found for every product. For server-side technologies, public version evidence is often unavailable; omit `version` rather than guessing.
- Treating API, schema, protocol, snippet, or wrapper version fields as the product version without verifying that they map to the actual shipped client library or SDK version.
- CPE guesses. Try to find a matching CPE, but add `cpe` only when it is high confidence.
- HTTP-only research when browser capture is broken or unavailable. Stop and report that blocker instead.

## Metadata Rules

- Keep descriptions neutral, factual, American English, and under 250 characters.
- Add `website` for the product homepage or canonical product page.
- Add `icon` only when you can source a square SVG or a reasonable PNG, ideally from the product site or official branding.
- Strongly prefer SVG over PNG. If the product site does not expose a usable asset directly, search other reputable brand sources and image indexes such as `brandfetch.com` or `brandsoftheworld.com` or perform a web search.
- Prefer a transparent-background square brand mark over a full wordmark or logo with text, and favor assets that still read cleanly at small sizes such as `16x16`.
- If the available SVG is a full logo with text, extract the standalone brand mark when practical so the final icon stays compact and legible.
- Never wrap a raster image inside an SVG just to satisfy the SVG preference.
- Do not draw or trace a new SVG from scratch or from a raster reference.
- You may edit an existing SVG to remove word marks, improve padding, recenter the artwork, or avoid clipping.
- If you use a PNG fallback after exhausting all options to find a suitable SVG, prefer an official square asset around `32x32` when available. If no better official candidate exists, `16x16` is acceptable.
- Omit `icon` if you cannot find a suitable asset.
- Check the product website for pricing information before setting `pricing`, especially when `saas` is `true`. Use the pricing definitions in `/Users/elbert/Sites/wappalyzer/extension/README.md` to choose `low`, `mid`, or `high` and any applicable `freemium`, `onetime`, `recurring`, `poa`, or `payg` flags. Base the cost band on the typical paid self-serve plan or average monthly price, not the highest enterprise tier unless that is the only clear paid option. Omit `pricing` when the public evidence is unclear.
- Infer `saas` and `oss` conservatively from public evidence and omit fields when unclear.
- Be especially conservative with `saas` and `cpe` for payment processors, infrastructure-like services, and broad web primitives; omit them unless the public evidence clearly supports the generic product-level classification.
- Put the technology in the JSON file that matches the first character of the technology name; use `_.json` for non-letter initials.

## Commands

Capture one site:

```bash
node /Users/elbert/.codex/skills/add-wappalyzer-technology/scripts/capture-evidence.js \
  --repo /Users/elbert/Sites/wappalyzer \
  --technology "Technology Name" \
  --website "https://vendor.example" \
  --url "https://sample-site.example" \
  --observe 3000 \
  --pretty
```

Compare captures:

```bash
node /Users/elbert/.codex/skills/add-wappalyzer-technology/scripts/compare-captures.js \
  --sample /tmp/sample-1.json \
  --sample /tmp/sample-2.json \
  --control /tmp/control-1.json
```

Validate the extension change:

```bash
cd /Users/elbert/Sites/wappalyzer/extension
yarn validate
```

## Delivery

When you finish:
- Summarize the evidence you used.
- Call out which fingerprints were chosen and why they are specific.
- Mention the control sites used for false-positive testing.
- State what was omitted, such as `cpe` or `icon`, and why.
- State whether the evidence came from a real browser capture and, if blocked, stop instead of substituting raw HTTP-only evidence.
