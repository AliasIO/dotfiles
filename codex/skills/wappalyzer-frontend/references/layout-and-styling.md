# Layout And Styling Notes

These notes summarize durable guidance from the official Vuetify 2 docs. Keep them aligned with the docs pages listed in `docs-map.md`.

## Nuxt 2 Setup

- Vuetify 2’s Nuxt install uses `@nuxtjs/vuetify` in `buildModules`.
- In this repo, `v4/frontend/nuxt.config.js` already uses:
  `treeShake: true`, `customVariables: ['~/assets/scss/variables.scss']`, `options.customProperties: true`, and a theme config.
- Put SASS variable overrides in `v4/frontend/assets/scss/variables.scss` unless there is a strong reason to use a different existing file.
- Tree-shaking is required for custom SASS variable overrides in the Nuxt module path.

## Application Shell

- Vuetify requires a single `v-app` wrapping all Vuetify-rendered UI.
- `v-main` is required for application content sizing; routed page content should live under it.
- Components with the `app` prop participate in layout sizing. Use documented application primitives instead of custom fixed positioning when possible:
  `v-app-bar`, `v-navigation-drawer`, `v-footer`, `v-system-bar`, `v-bottom-navigation`.
- The `app` prop applies `position: fixed`; use the documented `absolute` prop only when the layout genuinely needs to opt out.
- Avoid multiple concurrent instances of the same application-layout primitive unless the docs explicitly support the pattern.

## Grid And Responsive Layout

- Build page structure with `v-container` > `v-row` > `v-col`.
- `v-row` is the direct wrapper for columns; `v-col` is the 2.x replacement for older `v-flex` patterns.
- Use `cols` for default width. Breakpoint props are and-up and do not use `xs` variants.
- Prefer documented grid props such as `cols`, `sm`, `md`, `lg`, `xl`, `offset-*`, `order-*`, `align-*`, and `justify-*`.
- Use `dense` to tighten row gutters and `no-gutters` to remove them instead of CSS overrides.
- Use `v-spacer` to distribute remaining width before reaching for custom flex styles.

## Breakpoints

- Prefer `$vuetify.breakpoint` and helper classes over manual resize listeners.
- Useful documented breakpoint values:
  `xs`, `sm`, `md`, `lg`, `xl`, `xsOnly`, `smAndDown`, `mdAndUp`, `mobile`, `name`, `width`, `height`.
- Use breakpoint-driven props for responsive component behavior, for example dialog fullscreen on mobile.

## Display Helpers

- Prefer display helpers over CSS visibility rules:
  `d-{value}` and `d-{breakpoint}-{value}`.
- Common values are `none`, `block`, `inline`, `inline-block`, `flex`, and `inline-flex`.
- Use screen-reader helpers when accessibility needs hidden text:
  `d-sr-only` and `d-sr-only-focusable`.
- Use print helpers only when a screen or print requirement is explicit:
  `d-print-none`, `d-print-block`, `d-print-flex`, and related variants.

## Spacing Helpers

- Prefer spacing helpers instead of one-off CSS:
  `ma-*`, `mx-*`, `my-*`, `mt-*`, `mb-*`, `ml-*`, `mr-*`, `ms-*`, `me-*`, `pa-*`, and related variants.
- Vuetify spacing is documented in 4px increments from `0` through `16`.
- Negative margin helpers exist as `n1` through `n16`; use them sparingly and only when the layout system cannot express the relationship cleanly.
- Use logical start/end helpers (`s`, `e`) when directionality matters.

## Typography And Text Helpers

- Prefer typography helpers over custom font-size rules:
  `text-h1` through `text-h6`, `text-subtitle-1`, `text-subtitle-2`, `text-body-1`, `text-body-2`, `text-button`, `text-caption`, `text-overline`.
- Prefer text utility classes for alignment and overflow behavior:
  `text-left`, `text-right`, `text-start`, `text-end`, `text-no-wrap`, `text-truncate`, `text-decoration-*`.
- Use emphasis helpers before custom color rules:
  `text--primary`, `text--secondary`, `text--disabled`.
- For RTL-aware alignment, use `start` and `end` helpers instead of hard-coding `left` and `right` unless the visual requirement is direction-independent.

## Theme And Color

- Prefer `color` props and Vuetify theme tokens over hard-coded template colors.
- In this repo, theme colors are configured in `v4/frontend/nuxt.config.js`; extend that config instead of scattering repeated hex values through templates.
- Vuetify generates helper classes for theme colors, so prefer existing theme names such as `primary`, `accent`, `secondary`, and their `--text` forms before adding new CSS.
- `customProperties: true` is already enabled in this repo, so theme CSS variables are available when a documented CSS-variable use is truly necessary.
- Use component `dark` and `light` variants intentionally. The theme choice propagates from `v-app`.

## SASS Variable Overrides

- Use SASS variables when a documented Vuetify design token should change globally or at the component-token level.
- Choose the variable from the component API or the SASS variables docs before overriding it.
- Keep overrides in the variables file, not in new `<style>` blocks.
- Do not import regular stylesheets into the variables file; the docs warn this causes duplicated CSS.
- If a task truly requires reading Vuetify component variables directly, import the documented `~vuetify/src/.../_variables.scss` source, but only when there is no simpler token-level override already available.

## Practical Bias

- First choice: documented component props.
- Second choice: documented helper classes.
- Third choice: existing theme tokens or SASS variables.
- Last resort: custom CSS, and only after explaining why the Vuetify 2 path is insufficient.
