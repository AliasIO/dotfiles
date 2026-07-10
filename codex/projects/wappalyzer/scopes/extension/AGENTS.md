# Extension Instructions

- `extension/` is canonical for the browser extension runtime, detection engine, technology definitions, and icons. Submodule copies are disposable consumers.
- Technology definitions must use the `dom` detection field. The deprecated `html` field has been removed from the technology schema; do not add `html` fingerprints or restore schema, validation, migration, or runtime support for that field.
- Use `$add-wappalyzer-technology` for eligibility, evidence, fingerprint design, metadata, icons, and behavioral validation. Keep broad definitions free of vendor-CDN or marker-only `scripts` matches unless surrounding context is product-specific.
- Detect a technology only when the host site is made with it or directly integrates that product. A third-party SDK, telemetry request, iframe, or widget can identify the third-party product, but not its internal framework or dependencies without independent first-party evidence.
- Keep normal hosts cached by hostname. Preserve the current tab’s last detections across same-origin SPA route changes until a fresh page-level detection runs.
- Keep only dev/local/preview-style hostnames, top-level private-IP navigations, and top-level `4xx`/`5xx` documents tab-scoped. Broader ignore-list matches remain hostname-cached and are filtered only for ping eligibility.
- Only top-frame detections may update persistent hostname cache or ping traffic. Ignore subframe content, script, and XHR detections for hostname traffic.
- Keep `Driver.cache` live from module load and merge persisted state into it during initialization; service-worker listeners can run before asynchronous startup completes.
- Keep volatile hostname detections out of `storage.local`; use session storage or memory and serialize detections before storage writes.
- Treat dependency, category, and detection arrays from startup or cross-context messages as sparse or stale; guard entries before destructuring.
- The committed client intentionally drains and persists queued ping hits before network submission, giving network failures at-most-once delivery. This explicitly supersedes the older post-success-drain instruction; treat it as a product delivery-semantics decision, not a generic reliability preference. Do not change it without explicit product agreement and failure-path tests. Continue to skip empty-technology rows; server ingestion must also short-circuit them.
- Use cleaned visible text with strict confidence thresholds for language detection, store base languages, and derive technology language summaries from normalized per-hostname hit counts rather than HTML source or page-weighted membership.
- New `plan_` subscriptions use usage/quota checks. Reserve credit spending for legacy credit-bearing products, and treat fresh API-key `403`/`429` responses as possible propagation lag before declaring a key invalid.
