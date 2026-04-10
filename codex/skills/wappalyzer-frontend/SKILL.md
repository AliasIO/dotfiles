---
name: wappalyzer-frontend
description: Build and refactor the Wappalyzer frontend in `v4/frontend` with Nuxt 2 and Vuetify 2. Use when changing pages, layouts, components, forms, navigation, tables, or styling in `v4/frontend`; prefer Vuetify 2 primitives, documented props, helper classes, and SASS variable overrides over ad hoc markup, inline styles, or component-local `<style>` blocks.
---

# Wappalyzer Frontend

Use this skill when working on `v4/frontend`.

Treat the official Vuetify 2 docs at `https://v2.vuetifyjs.com/en/` as the source of truth. The bundled references below summarize durable guidance from those docs, but they do not replace checking the relevant official page before introducing or changing a pattern.

Start here:
- Work in `v4/frontend`.
- Read the surrounding page, layout, or component before changing structure.
- Preserve Nuxt 2 and Vuetify 2 patterns that are already established in the repo.
- Prefer Vuetify primitives, props, slots, and helper classes over custom wrappers and hand-rolled markup.
- Avoid inline `style` attributes.
- Avoid adding `<style>` blocks. If a visual change cannot be expressed with Vuetify props, helper classes, theme tokens, or SASS variable overrides, stop and explain why.
- Prefer SASS variable overrides in `v4/frontend/assets/scss/variables.scss` and existing theme configuration in `v4/frontend/nuxt.config.js` where possible.
- Account for both SSR and client hydration behavior.
- Do not run `nuxt build` when the local frontend dev server is already running unless the user explicitly asks for it.

Read these references before substantial frontend work:
- `references/docs-map.md` for the official Vuetify 2 pages to open for each task type.
- `references/layout-and-styling.md` for application shell, grid, responsive helpers, theme, and SASS rules.
- `references/components-and-forms.md` for forms, inputs, navigation, overlays, content components, icons, and data tables.

## Workflow

1. Identify the surface you are changing: page, layout, shared component, form, table, navigation, or theme/styling.
2. Open the matching official Vuetify 2 page from `references/docs-map.md` before changing props, slots, helper classes, or component composition.
3. Reuse existing project structure in `v4/frontend` where possible instead of inventing a parallel abstraction.
4. Build layouts with Vuetify’s application shell and grid primitives:
   `v-app`, `v-main`, `v-container`, `v-row`, `v-col`, `v-spacer`, `v-sheet`, `v-card`, `v-list`, `v-btn`, `v-form`, `v-dialog`, `v-menu`, `v-data-table`, and related helpers.
5. Express spacing, display, alignment, typography, and breakpoint behavior with documented Vuetify 2 props and helper classes first:
   `pa-*`, `ma-*`, `d-*`, `text-*`, flex helpers, breakpoint props, `dense`, `outlined`, `rounded`, `tile`, `elevation-*`, and `color`.
6. When a change needs styling beyond props and helper classes, prefer theme colors and SASS variables over CSS overrides.
7. If a variable override is the right fix, update `v4/frontend/assets/scss/variables.scss` and stay aligned with the Vuetify module config already present in `v4/frontend/nuxt.config.js`.
8. Keep interactions in the Vuetify 2 way:
   activator slots for overlays, `rules` and `v-form` for validation, list primitives inside drawers, and documented table slots for partial customization.
9. Validate the final UI against surrounding screens for responsive behavior, SSR safety, and consistency with the current design language.

## Defaults

- Use `mdiSvg`-compatible icons and documented `v-icon` patterns.
- Prefer `color` props and helper classes over hard-coded template colors.
- Prefer list, card, alert, chip, and button primitives over raw HTML plus classes.
- Prefer built-in component states such as `loading`, `disabled`, `readonly`, `error-messages`, `hint`, `hide-details`, and `persistent-hint` over custom logic or custom styling.
- Prefer documented slots over DOM patching when customization is needed.
- Prefer `v-simple-checkbox` inside `v-data-table` slots instead of `v-checkbox`.

## Delivery

When you finish frontend work:
- State which official Vuetify 2 pages you used.
- Call out any SASS variable or theme-level overrides.
- Mention any place where the repo’s existing pattern forced a tradeoff against the default Vuetify 2 approach.
