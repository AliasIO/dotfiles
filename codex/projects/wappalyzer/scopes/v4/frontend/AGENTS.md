# Frontend Instructions

- `v4/frontend/` is canonical for the Nuxt 2 / Vuetify 2 website. Use `$wappalyzer-frontend` for implementation conventions and `$deploy-wappalyzer` only for an explicitly requested rollout.
- Keep dynamic result pages under `/websites/*`, non-root `/lookup/*`, and `/verify/*` noindexed and out of submitted sitemaps.
- Keep sitemap routes aligned with `v4/frontend/static/robots.txt`; blocked subtrees must not reappear in sitemaps.
- Account for SSR and client hydration. Functions serialized into Nuxt module configuration must be self-contained and cannot rely on top-level closures.
- Retry only safe read methods. Do not auto-retry mutating requests on `429`, network failures, or transient `5xx`; those statuses can represent intentional business limits.
- Keep Stripe.js initialized sitewide for fraud signals; do not defer it only to checkout routes.
- Self-service account deletion goes through the authenticated API user route. Do not substitute browser-only Cognito deletion.
- Preserve exact keyword-search result totals unless the API contract and caller change together; limit returned rows independently.
- Website security headers are owned by the API headers service, not the frontend bundle.
- A production push dispatches the GitHub Actions deployment. Report dispatch separately from successful deployment and perform at least a one-shot workflow status check when deployment is authorized; continuous monitoring requires an explicit request.
