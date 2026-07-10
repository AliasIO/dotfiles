# CLI Instructions

- `cli/` is canonical for browser crawler and runtime behavior. `cli/wappalyzer` is an extension consumer; update it only through dependency propagation.
- Preserve `--single-process` for Lambda-compatible execution.
- Serialize browser relaunch on the shared `Driver`, never per `Site`, to avoid orphan Chromium processes and restart storms.
- Return the same analysis object passed through the `analyze` event so listener-added fields such as shared extract data survive to callers.
- Ignore subframe-origin XHR detections; embedded hosts must not influence the parent page’s technology result.
- On request-budget skips, still emit `goto` and let the shared extractor attempt the full extract before its lightweight company-signal fallback.
- Classify terminal CloudFront `403` and generic document `4xx`/`5xx` responses from status and headers before body reads or heavy extraction. Error-body reads can consume the crawler budget.
- Bound navigation and DevTools protocol operations to the crawler budget.
- `batchSize` is sequential link chunking, not parallel page fan-out; scale bulk concurrency at the outer job layer.
- When a new CLI helper is required by Batch, update the API Batch image copy list and smoke-load the image entrypoint.
