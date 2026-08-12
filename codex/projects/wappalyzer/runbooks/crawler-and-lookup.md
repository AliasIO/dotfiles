# Crawler and Lookup Contracts

Status: durable runtime contracts; live limits and deployed revisions require discovery  
Owner: Wappalyzer crawler and lookup  
Last verified: 2026-08-12 against the authenticated-crawler and managed-browser implementation
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

## Authenticated crawling and paid fallback

- Keep lookup cache-first. A live 20-second lookup performs only the direct crawl; when that crawl returns a confirmed Cloudflare challenge, it queues `crawl-async` without changing the public lookup response shape.
- Signed crawling uses Ed25519 Web Bot Auth HTTP Message Signatures. Sign only top-level document requests and redirects, append the stable `WappalyzerBot/1.0 (+https://www.wappalyzer.com/)` token to the browser user agent, and publish every configured public key at `https://api.wappalyzer.com/.well-known/http-message-signatures-directory`. Never publish `d` or log the private JWKS.
- The signatures directory must return `application/http-message-signatures-directory+json`, a five-minute public cache policy, and `Signature` plus `Signature-Input` binding headers. Return `503` with `no-store` when no valid private key is configured.
- Gate `robots.txt` handling independently with `WEB_BOT_AUTH_RESPECT_ROBOTS`. Keep it disabled by default for unsigned crawls, and force it on whenever request signing is enabled. When enabled, enforce Allow/Disallow and crawl-delay, cache rules for 24 hours, and preserve `WAPPALYZER_ROBOTS_DISALLOWED`, `WAPPALYZER_ROBOTS_DELAY_EXCEEDS_BUDGET`, and `WAPPALYZER_ROBOTS_UNAVAILABLE` as distinct handled outcomes.
- Classify a Cloudflare challenge only when a document response has `cf-mitigated: challenge` after case-insensitive normalization. Generic access blocks, branded pages, status codes, or heuristic text must not authorize paid fallback.
- The only paid fallback is the Bright Data Browser API over its Puppeteer WebSocket endpoint. It runs inline in `crawl-async` and mass lookup, never inline in live lookup. It blocks images, media, fonts, and other heavy resources; allows at most three concurrent sessions; uses a 120-second navigation budget and 180-second session budget; and records estimated transfer bytes without logging endpoint credentials.
- Claim a hostname atomically before using the paid route. The same hostname is ineligible for another paid attempt for 24 hours. Mass lookup additionally caps each shard at the lower of 50 attempts or 20% of its input rows.
- The implementation is inert until both the call-site fallback option and `MANAGED_BROWSER_FALLBACK_ENABLED` are true and a non-empty `BRIGHT_DATA_BROWSER_WEBSOCKET` is present.

Configuration defaults and secrets:

- Keep `WEB_BOT_AUTH_SIGN_REQUESTS=false`, `WEB_BOT_AUTH_RESPECT_ROBOTS=false`, and `MANAGED_BROWSER_FALLBACK_ENABLED=false` in committed configuration.
- Keep `WEB_BOT_AUTH_PRIVATE_JWKS_BASE64` and `BRIGHT_DATA_BROWSER_WEBSOCKET` outside repositories. Supply them through the authorized deployment secret path or the mass-lookup runtime-environment object in S3. Do not inject the private signing key into crawler functions until signing is ready to be enabled.
- Discover active Lambda layer revisions, image digests, Batch job definitions, and runtime-environment object keys at rollout time; do not copy identifiers from this runbook.

Authorized rollout sequence:

1. Generate one or more private Ed25519 JWKs offline, encode `{ "keys": [...] }` as base64, and store the value in the approved secret system. Retain the previous key during rotation until caches and in-flight signatures have expired.
2. Publish the dependencies layer and deploy the root service with signing still disabled. Verify the directory over GET and HEAD, confirm all intended public keys are present, confirm no private `d` value is exposed, and validate both binding headers.
3. Deploy the updated crawl-async artifact before lookup, with signing, robots handling, and managed fallback disabled. Confirm ordinary cached and direct crawls retain their baseline behavior and generic access blocks do not enqueue or start a paid browser session.
4. Submit the crawler to Cloudflare's Verified Bot program using the Direct/Data Collection category and the production directory URL. Inject the crawler signing key and enable `WEB_BOT_AUTH_SIGN_REQUESTS` together with `WEB_BOT_AUTH_RESPECT_ROBOTS` only after the directory is live and the identity is ready for verification. Validate a signed request against Cloudflare's official debug endpoint before broad rollout.
5. Create a dedicated Bright Data Browser API zone with provider-side spend controls. Store its WebSocket endpoint as a secret, keep fallback disabled, and smoke-test a single explicitly authorized challenge target.
6. Enable managed fallback in beta first. Monitor started/succeeded/failed/skipped counts, estimated transfer bytes, Cloudflare challenge rate, robots outcomes, latency, and provider billing before enabling production or mass lookup.

Rollback is flag-first: set `MANAGED_BROWSER_FALLBACK_ENABLED=false` to stop new paid sessions, set `WEB_BOT_AUTH_SIGN_REQUESTS=false` to stop signing, and set `WEB_BOT_AUTH_RESPECT_ROBOTS=false` to restore unsigned crawl behavior. Leave the public directory available during rollback and key rotation so already-issued signatures remain verifiable. Disabling or rotating live configuration, deploying services, changing Cloudflare registration, creating a Bright Data zone, or starting Batch work requires explicit Operate authority.

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
