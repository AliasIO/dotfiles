# Integrations and Email Runbook

Status: operational contract; external schemas and live limits require discovery  
Owner: Wappalyzer integrations operations  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: integration handlers, provider schemas, live webhook configuration, SQS/Lambda settings, and Cloudflare  
Verify with: inspect current provider schema/mapping, webhook delivery logs, edge events, Lambda/SQS configuration, and task role

## CRM input and mappings

- Skip missing, invalid, or unresolvable domains/websites in HubSpot, Salesforce, and Pipedrive instead of turning enrichment into a hard failure.
- Revalidate saved field mappings against each provider’s live schema before writes; deleted custom fields must not poison an entire run.
- Keep export-event functions sized for the largest live event partitions rather than the default Lambda baseline.
- New Salesforce application setup may use External Client App Manager; preserve the existing non-PKCE authorization-code contract unless the product flow changes.
- Salesforce create flows need explicit create criteria; `Is Changed` alone does not cover a newly populated record.
- Lead automation uses its dedicated outbound message/action and lead endpoint. Empty integration-event and Lambda logs indicate Salesforce did not deliver the webhook; investigate the flow before the handler.
- Parse Salesforce outbound-message fields from `sObject`, not the notification envelope ID, and return the SOAP `notificationsResponse` with `Ack=true`.
- For long-transaction failures in a subset sync, allow the first pass to finish and retry only failed record IDs with controlled sharding; do not replay known terminal invalid inputs.

## Webhook diagnosis

- If provider delivery reports an edge error but the matching Lambda has no invocation, inspect Cloudflare and API Gateway before changing handler code.
- Scope Cloudflare browser-integrity exceptions to the vendor webhook POST paths. A raw execute-api URL can isolate the edge during diagnosis but is not a permanent security design.
- Keep vendor-specific acknowledgement formats exact; a successful handler side effect is insufficient if the provider rejects the response body and retries.
- When a vendor reports `403` with no Lambda invocation, compare Cloudflare edge events and the raw execute-api stage. A raw endpoint is a temporary diagnostic bypass, not a permanent webhook URL.

## Email verification

- Keep the native verifier timeout several seconds below Lambda timeout and classify expected verifier failures as worker results.
- Bound SQS concurrency deliberately; do not allow unreviewed scaling to multiply SMTP fan-out.
- Persist the verified-email record on the hot path, but defer hostname-row reconciliation to its cron so hostname throttling cannot fail an already-verified result.
- Use NAT-backed private subnets or the required VPC endpoints. A private subnet routed only to an Internet Gateway has no outbound path without public addresses.
- Bound plan, credit, and usage prechecks to the remaining request budget and return a handled timeout.
- On website flood limits, use the shared reCAPTCHA gate and clear both services’ short user/IP keys after a successful challenge. Preserve the plan-subscriber bypass where the product contract requires it.
- Keep explicit API Gateway missing-authentication responses after removing old public wildcard routes; do not let the gateway surface a generic `500`.
- Keep disposable/personal mailbox filtering centralized in `Shared.emailBlacklist`. Persist verified-email rows on the shared 12-month TTL and update hostname auxiliary fields with field-level updates rather than full-row put cycles.
