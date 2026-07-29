# Project Conventions

## Nuxt and Vuetify

- Work in `$HOME/Projects/wappalyzer/v4/frontend` and follow adjacent Nuxt 2 options-API patterns.
- Keep one `v-app` application shell with routed content under `v-main`. Use application components with their documented layout behavior.
- Build page structure with `v-container`, `v-row`, and `v-col`; use breakpoint props and `$vuetify.breakpoint` rather than manual resize listeners.
- Prefer Vuetify spacing, display, flex, typography, and direction-aware helpers before CSS.
- The project config already exposes theme colors and SASS variables. Add a global token only when multiple surfaces should share the decision.
- A local visual exception may use `<style scoped>` after existing patterns, props/slots, helpers, and tokens are exhausted.

## Components and interactions

- Forms: use `v-form`, ordered `rules`, and documented `validate`, `reset`, and `resetValidation` APIs.
- Inputs: use built-in variants, hints, messages, counters, loading, readonly, disabled, clearable, and documented icon events.
- Overlays: use activator slots for dialogs, menus, and tooltips; preserve keyboard/focus behavior and use `persistent` only when dismissal would break the flow.
- Navigation: use app bars, drawers, lists, and responsive props rather than custom fixed-position shells.
- Tables: use built-in sorting/filtering/loading/selection/expansion and column slots. Replacing full header/body markup also assumes responsibility for those behaviors.
- Icons: use the configured `mdiSvg` strategy. Decorative icons are hidden from assistive technology; meaningful and clickable icons have accessible names and proper button semantics.

## SSR and configuration

- Avoid browser globals during server render; gate client-only APIs through lifecycle/client checks and keep initial markup stable across hydration.
- Functions serialized by Nuxt module configuration must be self-contained; generated `.nuxt` code does not retain top-level closures.
- Retry only safe read methods. Mutating requests can use `429` or `5xx` for business outcomes and must not be retried automatically by shared configuration.
- Keep retry budgets short unless a specific read flow justifies a different policy.

## Scope boundaries

- Route indexing, sitemap, Stripe bootstrap, account deletion, and security-header ownership are canonical in the frontend scoped `AGENTS.md`.
- Publication and deployment mechanics belong to `$deploy-wappalyzer`, never this implementation skill.
