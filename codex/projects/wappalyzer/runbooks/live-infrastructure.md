# Live Infrastructure Runbook

Status: operational guidance; rediscover live values before mutation  
Owner: Wappalyzer operations  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: live AWS, Cloudflare, Stripe, Google, and repository stage configuration  
Verify with: read-only provider queries plus the relevant `env.<stage>.yml`, workflow, or service configuration

## Safety boundary

- Treat names, revisions, regions, schedules, capacity modes, app clients, mappings, and attached layers in prose as hints only. Query the provider before acting.
- An Inspect request permits discovery but not mutation. Any AWS, Cloudflare, Cognito, Stripe, Google, or production GitHub workflow mutation requires Operate authority.
- A non-production deployment is production-impacting when it shares Cognito triggers, Batch compute, DNS, CloudFront, usage plans, or another live resource.

## Cognito and OAuth

- User-pool and app-client settings are live AWS configuration, not infrastructure owned by this workspace. Repository changes can update triggers and referenced configuration only.
- Discover the shared pool and legacy migration pool from current stage configuration. Preserve legacy lookup compatibility until migration code and data no longer require it.
- Google OAuth clients used by the website must request and allow `aws.cognito.signin.user.admin`; social-provider mappings include both `email` and `email_verified`; password signup requires email auto-verification.
- Limit local signup to the intended website app client while preserving external-provider flows. Run blocked-domain checks consistently for local and social signup.
- A shared pool supports one active Lambda per trigger. Identify the current owner before deploying any trigger service; deploy order is not a safe ownership model.
- Use a complete `update-user-pool` payload for live setting changes because omitted fields can reset.
- Hosted MCP uses its dedicated app client and auth domain. Gmail compatibility may depend on the live auth proxy and legacy-client rewrite; inspect that proxy before altering the add-on or pool.

## Cloudflare, API Gateway, and CloudFront

- Public DNS is delegated to Cloudflare; do not assume the Route 53 hosted zone is authoritative.
- Discover root and multi-level API mappings with API Gateway v2 APIs. Multi-level mapping deletion must use the v2 mapping identifier, not the v1 base-path command.
- Root `api.wappalyzer.com` behavior can be produced by custom-domain mappings before a Lambda runs. Check gateway and Cloudflare logs before diagnosing a service handler.
- Vendor webhooks need a verified Cloudflare bypass for browser-integrity rules. Scope exceptions to the exact methods and paths; do not trust spoofable proxy headers on raw execute-api paths.
- The website’s security headers are deployed by the API headers service. Discover the CloudFront Lambda@Edge version association; publishing a Lambda version alone does not switch the distribution.
- Lambda@Edge versions cannot carry ordinary environment variables or layers.

## Deployment and observability

- Compare a function’s attached layer ARNs with stage configuration; changing an env file or publishing a layer does not update existing consumers.
- Query API Gateway usage plans when changing key-based rate limits; per-service Serverless throttles may not be the active control.
- Query EventBridge rules, Batch job-definition revisions, task-definition families, compute environments, dashboards, and schedules. Do not copy generated cluster IDs or assume repository YAML owns them.
- Prefer custom application metrics for systems whose AWS service metrics are absent or misleading. Dashboard widget resources must be rediscovered after compute-environment rotation.
- For Serverless observability teardown, disable live instrumentation before removing the provider integration; inspect CloudFormation failures rather than repeating blind deletion.
