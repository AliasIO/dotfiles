# Metadata and Icons

## Metadata

- `description`: neutral, factual, American English, fewer than 250 characters.
- `website`: canonical product page or vendor homepage for the product.
- `cats`: prefer one primary category; add a second only for a genuinely balanced classification.
- `cpe`: research it, but add only when highly confident.
- `saas` and `oss`: infer conservatively; omit when unclear. Be especially careful for payment processors, infrastructure, and broad web primitives.
- `pricing`: inspect the current public pricing and use the definitions in `extension/README.md`. Base bands on the typical paid self-service plan or average monthly cost, not an exceptional enterprise tier. Omit unclear pricing.
- For `dom`, use a selector string for existence and object form only for attribute, property, or text matching.

## Icons

1. Prefer an official transparent square SVG mark that matches current public branding and remains legible at small size.
2. If the product site has no usable asset, search reputable brand sources and compare candidates with the current official mark.
3. Extract a standalone mark from an existing full-logo SVG when practical. Removing wordmarks, recentering, padding, and clipping fixes are allowed.
4. Never trace a new SVG from a raster image or wrap a raster inside SVG.
5. Use PNG only after exhausting suitable SVG sources. The committed PNG must be no larger than `32x32`; resize larger sources, prefer `32x32`, and accept `16x16` when no better official asset exists.
6. Omit `icon` when no suitable asset is available.

- Keep SVG viewBoxes square, visually centered, minimally padded, and unclipped.
- Do not reject a user-supplied ticket asset solely because it is third-party; compare it with first-party choices and use the best current mark.
- Preview the committed icon at small size before delivery.
