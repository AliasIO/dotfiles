# Project Instructions

## Product Direction

- Treat ISO100 as a portfolio-first photography service, not a generic website builder, social network, client-delivery suite, or photographer business-management platform.
- Favor decisions that improve public portfolio quality, image presentation, simple publishing, and clear free-vs-paid upgrade boundaries.
- Keep the product direction aligned with `/Users/elbert/Projects/iso100/docs/product-plan.md`; update that document when changing durable product assumptions instead of scattering product notes elsewhere.
- Use direct buyer language for public copy. Avoid meta commentary about page formats or internal positioning work.

## Design Direction

- ISO100-owned surfaces should feel minimal, industrial, precise, and image-led.
- Use white, black, and accent `#ff4b5e` as the core ISO100 brand palette unless the user explicitly changes the direction.
- Avoid decorative rounded cards, rounded inputs, pill buttons, gradients, shadows, glassmorphism, blobs, and soft SaaS styling on ISO100 brand/product surfaces. Functional contrast scrims, transparency indicators, and narrowly specified legibility shadows are allowed when required by an authoritative rendering contract.
- Create hierarchy with spacing, borders, alignment, scale, contrast, and strong image presentation.
- Do not let ISO100 chrome compete with photographer work; photos should remain the visual focus.

## Public Portfolio Design Direction

- Public portfolios are photographer-owned surfaces. They should feel like quiet, high-end photography portfolios, not ISO100 product pages.
- Do not use ISO100 branding, accent colors, marketing copy, product chrome, logos, or navigation on public portfolio pages.
- The only ISO100 branding exception is the branded `Made with ISO100` footer on free accounts. Paid accounts and custom-domain portfolios should have no ISO100 branding unless explicitly enabled by the photographer.
- Let the photographer's images dominate. UI should recede and use neutral white, near-white, black, or near-black themes.
- Avoid decorative gradients, shadows, glass effects, blobs, rounded cards, pill buttons, and SaaS-style panels. Follow `docs/portfolio-layout-contract.md` for functional image-dimming gradients, scrims, and legibility shadows on full-image covers; those are accessibility and rendering behavior, not decoration.
- Use restrained typography with normal casing. Avoid uppercase-heavy labels except where genuinely useful for tiny metadata.
- Use spacing, alignment, borders, image scale, and contrast for hierarchy.
- Keep portfolio navigation minimal: photographer name, gallery links, about, and contact where enabled.
- Do not add explanatory product text like "portfolio", "gallery experience", "powered by", or "published with" inside the main page chrome.
- Photo pages, gallery pages, and lightbox/detail views should feel immersive and editorial, not dashboard-like.
- Metadata should support the photograph: title, caption, location, date, camera, and license where available, never internal processing stats.
- Contact forms should be visually quiet and photographer-facing, not lead-gen styled.
- Any controls should be plain, precise, and small: text links, simple icon buttons, or minimal bordered controls.
- Mobile layouts should preserve image impact first, then navigation, then metadata.

## Layout Editor

- When the user asks to open or show "the lab," default to the local Portfolio Cover Lab at `http://127.0.0.1:3000/dev/portfolio-cover-lab` unless they identify a different lab. Start it with `npm run dev --workspace=@iso100/studio -- --host 127.0.0.1 --port 3000`, then open that route. It is the dev-only page headed `Local cover lab`, backed by `apps/studio/nuxt/app/components/studio/DevPortfolioCoverLab.vue`; do not substitute the Studio dashboard or the static renderer fixture.
- Treat layout editor cover previews as representative scaled versions of the public portfolio page, not abstract placeholders.
- Preserve the public page's visual contract in the editor: cover size/aspect ratio, hero height, page background color, image crop, tint or overlay color, text color, font family, font weight, approximate font scale, text alignment, text position, spacing, gallery proportions, and visible section balance.
- Cover image cropping must use the same focus-point behavior as the public page across all cover sizes and layout presets. If a photographer sets a focus point, the editor preview, preset thumbnails, and published portfolio should all crop around the same focal area.
- Preset buttons may stay as abstract grey blocks and skeleton bars. They should be static preset diagrams and must not change based on the selected photo, selected font, real title text, or other current portfolio context. Their fixed cover size, page/background balance, overlay/tint tone, text-block proportions, text positioning, gallery-grid proportions, and focus-point crop implication must still be representative of the published layout.
- If public portfolio rendering changes for a layout style, update the editor preview and preset thumbnail representation at the same time.
- When validating layout-editor changes, compare the editor preview against the rendered public portfolio at desktop and mobile widths. The preview does not need to be pixel-identical, but the proportions, typography, color treatment, crop/focus behavior, and placement must be faithful.

## Architecture

- The current workspace uses `apps/marketing/nuxt` for the Nuxt/Vue marketing site, `apps/studio/nuxt` for the logged-in Nuxt/Vue Studio, `packages/api` for Lambda API handlers, `packages/contracts` for the OpenAPI contract, and `packages/portfolio-renderer` for static public portfolio output.
- Root CDK manages AWS infrastructure including S3, CloudFront, ACM, Cognito, API Gateway, Lambda, DynamoDB, SQS, and supporting services. Production public DNS is authoritative in Cloudflare with `externalDns: true`; Route 53 constructs remain compatibility abstractions and are not the current production DNS control plane.
- Use `AWS_PROFILE=iso100 AWS_REGION=us-east-1` for AWS commands. The profile must resolve to account `799414939380` through an assumed role whose name contains `ISO100`; never run project commands with AWS root credentials. Stop before any AWS mutation if the identity check fails.
- Treat `iso100.app` and `www.iso100.app` as CloudFront-backed marketing domains and `studio.iso100.app` as the logged-in product domain.
- Continue using Nuxt, Vue 3, TypeScript, the shared shadcn-vue-derived UI package, and Tailwind for web clients, with native SwiftUI for iOS.
- Keep core business logic out of Nuxt server routes. The web clients and iOS app should be peer clients of the same versioned HTTPS API.

## Domain Model

- Keep ISO100-owned product surfaces separate from photographer public surfaces:
  - `iso100.app` for the marketing site.
  - `studio.iso100.app` for the logged-in product.
  - `api.iso100.app` for the versioned API.
  - `auth.iso100.app` if Cognito Hosted UI needs a dedicated domain.
  - `username.iso100.photos` for free public photographer portfolios. Treat matching `username.iso100.app` hosts as legacy redirects only.
  - `preview.iso100.app` for controlled portfolio previews.
  - `uploads.iso100.app` for signed browser upload targets.
  - `media.iso100.app` for first-party media delivery where configured.
  - `domains.iso100.app` as the Cloudflare for SaaS fallback target for paid custom domains.
  - Custom domains for paid public portfolio surfaces.
- Logged-in account, billing, destructive actions, and admin flows should stay on ISO100-controlled application domains, not on user subdomains or custom domains.
- Backend validation must be authoritative for public username/subdomain reservation; frontend validation can mirror it only for user experience.

## Web Workflow

- Build the marketing app with `npm run build:marketing` and the Studio app with `npm run build:studio`.
- Root `npm run build` runs the design-system registry check and TypeScript validation; it does not build either Nuxt app.
- Regenerate and verify the public renderer sample with `npm --prefix packages/portfolio-renderer run generate:sample` and `npm --prefix packages/portfolio-renderer run verify:sample` when renderer behavior changes.
- Keep CDK and static deploy paths aligned with `apps/marketing/nuxt/.output/public`, `apps/studio/nuxt/.output/public`, and the portfolio renderer output.
- For visual changes, verify the rendered page in a browser or with a screenshot flow when practical, especially across light/dark behavior and mobile widths.

## iOS Workflow

- `ios/` contains the native SwiftUI placeholder app used for the App Store name and bundle identifier.
- For iOS app code or asset changes, validate the file-level result at minimum. Rebuild/run in the simulator when the change affects runtime behavior or visible SwiftUI UI.
- Preserve the app identity unless the user asks otherwise:
  - Display name: `ISO100`
  - Bundle identifier: `app.iso100`
  - Minimum iOS version: `17.0`

## DNS And Deploy Checks

- Do not deploy, republish, invalidate production caches, or otherwise mutate live ISO100 infrastructure unless the user explicitly asks for that action in the current request. Prior deploy approval from earlier turns does not carry forward. If the user asks to implement or fix something without saying to deploy, stop after local verification, commit, and push.
- Permission to deploy code, infrastructure, or static applications never authorizes republishing existing customer portfolios. Do not trigger customer publishes, no-op saves followed by publishes, support act-as publishes, bulk republishing, or publish rollbacks unless the user separately and explicitly requests that exact customer-portfolio action in the current request. Do not use a customer publish as deployment verification. When renderer changes require republishing to affect existing sites, deploy the code only, report that existing portfolio HTML remains unchanged, and ask for separate authorization before republishing any customer portfolio.
- Before any authorized AWS mutation, verify `aws sts get-caller-identity --profile iso100` returns the expected account through a non-root assumed role whose name contains `ISO100`; refuse root or unexpected identities.
- DNS and AWS output values can drift. Re-check live AWS and public DNS before giving a current operational answer.
- When local DNS disagrees with expected delegation, compare `dig +trace NS iso100.app` with at least one public resolver such as `1.1.1.1`, `8.8.8.8`, or `9.9.9.9` before concluding propagation is incomplete.
- If the in-app browser is unreliable for previewing the live site, use a direct browser/screenshot fallback rather than guessing from deployed files.

## Git And Local Edits

- Always work on `master` for ISO100. Do not create feature branches unless the user explicitly asks.
- After making changes, commit and push them. If the push is rejected because `master` moved, rebase on the remote branch, resolve carefully, then push.
- This repo may have substantial uncommitted setup work. Do not reset, clean, or discard local files unless the user explicitly asks.
- Before committing, inspect status and keep unrelated user changes out of the commit where practical.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Projects/dotfiles/codex/projects/iso100/AGENTS.md`; the repo-root `AGENTS.md` should be a symlink to it.
