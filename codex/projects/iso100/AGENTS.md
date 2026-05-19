# Project Instructions

## Product Direction

- Treat ISO100 as a portfolio-first photography service, not a generic website builder, social network, client-delivery suite, or photographer business-management platform.
- Favor decisions that improve public portfolio quality, image presentation, simple publishing, and clear free-vs-paid upgrade boundaries.
- Keep the product direction aligned with `/Users/elbert/Sites/iso100/docs/product-plan.md`; update that document when changing durable product assumptions instead of scattering product notes elsewhere.
- Use direct buyer language for public copy. Avoid meta commentary about page formats or internal positioning work.

## Design Direction

- ISO100-owned surfaces should feel minimal, industrial, precise, and image-led.
- Use white, black, and accent `#ff4b5e` as the core ISO100 brand palette unless the user explicitly changes the direction.
- Avoid rounded cards, rounded inputs, pill buttons, gradients, shadows, glassmorphism, decorative blobs, and soft SaaS styling on ISO100 brand/product surfaces.
- Create hierarchy with spacing, borders, alignment, scale, contrast, and strong image presentation.
- Do not let ISO100 chrome compete with photographer work; photos should remain the visual focus.

## Public Portfolio Design Direction

- Public portfolios are photographer-owned surfaces. They should feel like quiet, high-end photography portfolios, not ISO100 product pages.
- Do not use ISO100 branding, accent colors, marketing copy, product chrome, logos, or navigation on public portfolio pages.
- The only ISO100 branding exception is the branded `Made with ISO100` footer on free accounts. Paid accounts and custom-domain portfolios should have no ISO100 branding unless explicitly enabled by the photographer.
- Let the photographer's images dominate. UI should recede and use neutral white, near-white, black, or near-black themes.
- Avoid decorative styling: no gradients, shadows, glass effects, blobs, rounded cards, pill buttons, or SaaS-style panels.
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

- Treat layout editor cover previews as representative scaled versions of the public portfolio page, not abstract placeholders.
- Preserve the public page's visual contract in the editor: cover size/aspect ratio, hero height, page background color, image crop, tint or overlay color, text color, font family, font weight, approximate font scale, text alignment, text position, spacing, gallery proportions, and visible section balance.
- Cover image cropping must use the same focus-point behavior as the public page across all cover sizes and layout presets. If a photographer sets a focus point, the editor preview, preset thumbnails, and published portfolio should all crop around the same focal area.
- Preset buttons may stay as abstract grey blocks and skeleton bars. They do not need to render the real photo, real text, or exact fonts, but their cover size, page/background balance, overlay/tint tone, text-block proportions, text positioning, gallery-grid proportions, and focus-point crop implication must still be representative of the published layout.
- If public portfolio rendering changes for a layout style, update the editor preview and preset thumbnail representation at the same time.
- When validating layout-editor changes, compare the editor preview against the rendered public portfolio at desktop and mobile widths. The preview does not need to be pixel-identical, but the proportions, typography, color treatment, crop/focus behavior, and placement must be faithful.

## Architecture

- Current infrastructure is CDK-managed in `/Users/elbert/Sites/iso100` with S3, CloudFront, Route 53, ACM, and deployment from `web/`.
- Use the AWS CLI profile `iso100` for AWS commands unless the user specifies otherwise.
- Treat `iso100.app` and `www.iso100.app` as CloudFront-backed public site domains.
- For future app work, prefer Nuxt, Vue 3, TypeScript, shadcn-vue, and Tailwind for the web client, with native SwiftUI for iOS.
- Keep core business logic out of Nuxt server routes. The web app and future iOS app should be peer clients of the same versioned HTTPS API.
- Prefer AWS-native backend primitives: Cognito, API Gateway HTTP API, Lambda, DynamoDB on-demand, S3, CloudFront, and Stripe webhooks.

## Domain Model

- Keep ISO100-owned product surfaces separate from photographer public surfaces:
  - `iso100.app` for the marketing site.
  - `studio.iso100.app` for the logged-in product.
  - `api.iso100.app` for the versioned API.
  - `auth.iso100.app` if Cognito Hosted UI needs a dedicated domain.
  - `username.iso100.app` for free public photographer portfolios.
  - Custom domains for paid public portfolio surfaces.
- Logged-in account, billing, destructive actions, and admin flows should stay on ISO100-controlled application domains, not on user subdomains or custom domains.
- Backend validation must be authoritative for public username/subdomain reservation; frontend validation can mirror it only for user experience.

## Web Workflow

- `web/` currently contains the static website placeholder. Do not assume a framework has already been installed until the repo confirms it.
- If converting the site to Nuxt or another framework, keep the CDK deployment path aligned with the generated static output.
- For visual changes, verify the rendered page in a browser or with a screenshot flow when practical, especially across light/dark behavior and mobile widths.

## iOS Workflow

- `ios/` contains the native SwiftUI placeholder app used for the App Store name and bundle identifier.
- For iOS app code or asset changes, validate the file-level result at minimum. Rebuild/run in the simulator when the change affects runtime behavior or visible SwiftUI UI.
- Preserve the app identity unless the user asks otherwise:
  - Display name: `ISO100`
  - Bundle identifier: `app.iso100`
  - Minimum iOS version: `17.0`

## DNS And Deploy Checks

- DNS and AWS output values can drift. Re-check live AWS and public DNS before giving a current operational answer.
- When local DNS disagrees with expected delegation, compare `dig +trace NS iso100.app` with at least one public resolver such as `1.1.1.1`, `8.8.8.8`, or `9.9.9.9` before concluding propagation is incomplete.
- If the in-app browser is unreliable for previewing the live site, use a direct browser/screenshot fallback rather than guessing from deployed files.

## Git And Local Edits

- Always work on `master` for ISO100. Do not create feature branches unless the user explicitly asks.
- After making changes, commit and push them. If the push is rejected because `master` moved, rebase on the remote branch, resolve carefully, then push.
- This repo may have substantial uncommitted setup work. Do not reset, clean, or discard local files unless the user explicitly asks.
- Before committing, inspect status and keep unrelated user changes out of the commit where practical.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Sites/dotfiles/codex/projects/iso100/AGENTS.md`; the repo-root `AGENTS.md` should be a symlink to it.
