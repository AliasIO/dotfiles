# Auth and Billing Contracts

Status: durable code contracts plus externally managed configuration  
Owner: Wappalyzer identity and billing  
Last verified: not reverified during the 2026-07-10 instruction migration  
Source of truth: auth/billing handlers, shared user logic, stage configuration, Cognito, Stripe, API Gateway, and DynamoDB  
Verify with: inspect current code/tests first, then read-only provider configuration before a live change

## Subscription and Stripe behavior

- `plan_` subscriptions use usage/quota checks; reserve credits for legacy credit-bearing products.
- Require a non-null top-level Stripe `subscription.plan.id`. Missing plan data is a configuration error; do not infer it from subscription items.
- Interpret `cancel_at_period_end` as cancellation at `current_period_end`; ordinary scheduled cancellation may not populate `cancel_at`.
- Keep the plans-table write on the critical subscription webhook path and rethrow before it succeeds so Stripe retries rather than leaving entitlements stale.
- Track purchases when `customer.subscription.*` completes an order from `subscription.metadata.orderId`; invoice metadata is not guaranteed to carry the order ID.
- Read the Stripe signature header case-insensitively and fall back to multi-value headers.
- Force Cognito managed login with `prompt=login` for recently-authenticated actions; silent Hosted UI reuse can leave the protected call unauthorized.
- The plans-sync cron reconstructs plan rows from live subscriptions but does not reconcile originating order rows. Diagnose a `Pending` order independently after webhook loss.
- Discover live table billing mode. Bursty plans/flood traffic prefers on-demand; if provisioned/autoscaled, use verified non-starving minimums rather than stale prose values.

## Signup and account controls

- Keep signup reCAPTCHA fail-closed on timeout or transport failure.
- Cognito PreSignUp does not receive a trustworthy client source IP. Enforce IP flood control at a trusted edge/API before `SignUp`.
- Route `SignUp`, `ForgotPassword`, and `ResendConfirmationCode` initiation through throttled API endpoints; do not expose unrestricted public-client calls from the browser.
- Limit first-time Google accounts at the API callback/PreSignUp marker. Do not throttle raw Google sign-in initiation for returning users.
- Keep blocked-domain behavior aligned between local pre-signup and token/user sync; disable an existing blocked-domain account that reaches token issuance.
- Restrict local signup to the intended website app client while preserving external-provider signup.
- Self-service account deletion uses the authenticated API user route and disables the user. Keep disabled-user sign-in/reset responses masked like nonexistent accounts.
- Normalize stringified custom-authorizer booleans before permission checks.
- Localhost origin matching supports localhost and `127.0.0.1`, HTTP/HTTPS, and arbitrary development ports. Resolve users through canonical ID, Cognito subject, `cognito:username`, or email rather than subject alone.

## Shared-pool migration

- Treat a legacy-pool email match as an existing account for local and social signup. If the Cognito email filter misses, fall back through the users email index and legacy username candidates.
- For Google linking, inspect provider `identities`; do not rely on a `Google_...` username prefix. Prefer a current-pool row carrying `canonicalUserId` over a federated duplicate.
- When PreTokenGeneration lacks `custom:canonicalUserId`, recover it by email/legacy identity before writing the shared-pool row.
- Repair a paid/free duplicate collision in both places: remove/repair the duplicate data row and set the Cognito user’s `custom:canonicalUserId`, or sync can recreate it.
- Write the standard Cognito `name` attribute as `name`, not `custom:name`.
- Gate post-confirmation welcome mail by `event.triggerSource`; password-reset confirmation also invokes PostConfirmation.
- ECS user lookups needing legacy fallback receive both legacy region/pool variables through the launcher and the shared environment whitelist.

## OAuth clients and tool metadata

- Website Google OAuth needs `aws.cognito.signin.user.admin`; social-provider mappings include `email_verified` with `email`; password signup depends on email auto-verification.
- Hosted MCP uses its dedicated app client/domain. Tool declarations explicitly set read-only, destructive, and open-world hints, and OAuth metadata advertises `offline_access` with the tool scope.
- Gmail legacy-client compatibility and popup isolation behavior may live in the auth proxy. Inspect the proxy before changing the add-on, authorizer region, or Cognito branding.
