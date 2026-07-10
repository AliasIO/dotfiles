# Crawler and Lookup Contracts

Status: durable runtime contracts; live limits and deployed revisions require discovery  
Owner: Wappalyzer crawler and lookup  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: `cli`, `v4/apis-shared`, lookup/crawl-async handlers, Dockerfiles, tests, and deployed configuration  
Verify with: inspect the relevant path-scoped AGENTS file, current tests/config, built image, and target function budget

## Failure semantics and time budgets

- `crawl-async` rethrows unexpected initialization/analysis errors after logging; only handled site-level failures are swallowed. A broken deploy must remain visible in Lambda errors.
- Bound `page.goto()` and Puppeteer protocol operations to the crawler budget. Default page timeouts alone do not constrain navigation or stuck DevTools commands.
- Treat branded terminal CloudFront `403` documents as access blocks. Classify CloudFront and generic document `4xx`/`5xx` from status/headers before reading a possibly hanging body or performing heavy extraction.
- Clamp analysis, cleanup, browser restart, and best-effort writes to the remaining invocation time. A live non-recursive lookup also has a handler-level timeout derived from that remaining budget.
- After a timeout, skip synchronous page destruction and schedule browser recycle. Do not let cleanup turn a handled timeout into the platform timeout.
- Keep post-crawl hostname/dataset persistence best-effort and time-bounded.

## Refresh and validation

- Outside live lookup, enqueue an empty-result refresh only when the exact hostname row is missing or its `crawlAttemptedAt` is absent/older than the configured recrawl window. `crawlActive` remains the short duplicate lease, not freshness.
- URL validation rejects definitive absence of public A/AAAA records and exclusively private addresses, but tolerates technical/transient DNS failures.
- Treat `.ai`, `.am`, `.co`, `.fm`, `.io`, `.me`, and `.tv` as generic TLDs before certificate, phone, and IP country evidence.
- Preserve certificate information from `response.securityDetails()` when lower-level certificate fetch fails and prefer standard X.509 country/state fields.
- Use `geoip-lite`; preload it during tight-budget handler initialization. Attach the dependency layer to non-container functions that require the local database.

## Packaging

- `lookup` and `crawl-async` remain browser-containing images; `ping` and `lookup-site` remain Lambda-plus-layer handlers.
- Lookup copies selected shared files into `/var/task/`, not `/var/task/shared/`; helper imports and Docker destinations must match.
- Batch copies the shared tree but explicitly copies CLI helpers. Lookup and crawl-async enumerate shared files and SDK packages. Update every affected image manifest/copy path and smoke-load each entrypoint after a new import.
- Set `PUPPETEER_SKIP_DOWNLOAD=true` for container installs.
- When shared AWS helpers add an SDK v3 client, add the package to both lookup and crawl-async container manifests.
- For direct runtime migration of a legacy zip containing a broken Serverless SDK wrapper, rebuild it with a plain bootstrap passthrough rather than only flipping the runtime.

## Shared compatibility and data

- Preserve AWS v2-style error codes and retry configuration while using SDK v3, and keep S3 cross-region redirect handling.
- Keep LinkedIn rows on the common 12-month TTL and use hostname materialization contracts from `data-and-batch.md`.
- The exact company-name ranking and fallback behavior is canonical in the `extract/` scoped AGENTS file.
