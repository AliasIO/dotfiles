# Repo Guide

## Real edit locations

- The workspace root `/Users/elbert/Sites/wappalyzer` is not a Git checkout.
- The browser extension is its own Git repo at `/Users/elbert/Sites/wappalyzer/extension`.
- The CLI used for evidence capture lives at `/Users/elbert/Sites/wappalyzer/cli`.
- Do not edit submodule copies such as `cli/wappalyzer` or `v4/apis/*/wappalyzer`.

## Canonical files

- Definitions: `extension/src/technologies/*.json`
- Icons: `extension/src/images/icons/`
- Categories: `extension/src/categories.json`
- Schema: `extension/schema.json`
- Validation: `extension/bin/validate.js`
- Icon conversion: `extension/bin/convert.js`
- Detection engine: `extension/src/js/wappalyzer.js`
- Extension docs: `extension/README.md`

## Definition placement

- Put the technology in the file named after the first character of the technology name.
- Use `_.json` when the technology name does not begin with `a-z`.
- `extension/bin/validate.js` enforces this and will fail if the entry is in the wrong file.

## Validation commands

Run from `/Users/elbert/Sites/wappalyzer/extension`:

```bash
yarn validate
```

Useful follow-ups:

```bash
yarn prettify
yarn convert:fast
```

Use `yarn convert:fast` only if you need to refresh missing or stale converted PNGs for icons. It is not required for every metadata change.

## Git-history patterns

Read history from the `extension/` repo:

```bash
git log --oneline -- src/technologies src/images/icons README.md bin
git show <commit> -- src/technologies/<file>.json src/images/icons/<icon>
```

Recent examples worth imitating:
- `be4383fb1` adds a new technology and icon together.
- `c90828f2c` renames a technology, updates icon and website, and broadens `scriptSrc`.

## Detection fields

The extension README and schema cover the supported fields. Common ones for new definitions:
- `cats`
- `description`
- `website`
- `icon`
- `cpe`
- `oss`
- `saas`
- `pricing`
- `js`
- `dom`
- `headers`
- `cookies`
- `meta`
- `scriptSrc`
- `scripts`
- `xhr`
- `implies`
- `requires`
- `requiresCategory`
- `excludes`

## Practical notes

- The local CLI already captures requests, response headers, cookies, script URLs, inline scripts, external script bodies, meta tags, and page HTML.
- The bundled skill capture script should be run in a real browser environment and kept alive for a short post-load observation window before the final page snapshot is taken.
- Prefer Puppeteer's managed Chrome for Testing unless there is a known-good reason to override `CHROMIUM_BIN`; a bad browser override can disconnect before the first request and invalidate the capture.
- Keep browser-capture work in `cli/`; do not add browser-behavior changes to the extension for research tasks.
- `extension/bin/validate.js` checks category IDs, regex syntax, icon existence, website URL format, and `implies` or `excludes` references.
- The project rule for new definitions is to confirm fingerprints on multiple live sites when practical, prefer specific JS globals with fallback signals, and test unrelated control sites before shipping.
