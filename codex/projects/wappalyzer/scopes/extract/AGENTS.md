# Extract Alias Instructions

- `extract/` is not an independent implementation. Make shared extractor changes in `v4/apis-shared/` and keep all four aliases byte-identical; do not replace a link with a divergent copy.
- On request-budget skips, try the normal full extract after `goto` before the lightweight company-signal pass.
- Prefer content-derived company signals and preserve their display casing. Do not add hardcoded brand/domain overrides or promote an inferred brand into `keywords`.
- Rank authoritative company signals before product/site branding: schema `Organization.name` or `legalName`, schema publisher, and copyright precede `WebSite.name`, site name, and title.
- Split comma-separated schema aliases and slash-delimited title fragments before scoring. Trim generic descriptor, locale, market, download, and category suffixes after an exact domain-brand token.
- For a raw domain-label fallback, recover casing and spacing from an exact tokenized page-content match; otherwise humanize the registrable label rather than uppercasing it.
- Evaluate redirected content against the final successful result URL while preserving the originally requested domain for raw fallback labels.
