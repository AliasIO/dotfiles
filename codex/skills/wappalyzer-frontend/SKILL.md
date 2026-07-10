---
name: wappalyzer-frontend
description: Implement and locally validate Wappalyzer website changes in `v4/frontend` using the repository’s Nuxt 2 and Vuetify 2 conventions. Use for pages, layouts, components, forms, navigation, tables, responsive behavior, SSR/hydration, accessibility, or styling. This skill permits local task-owned edits when implementation is requested; it never commits, pushes, dispatches GitHub Actions, or deploys. A request to review or verify is read-only unless edits are explicit.
---

# Wappalyzer Frontend

## Authority

- Use Inspect for review, diagnosis, or verification without edits.
- Use Implement only when the user asks for a change; keep work local and task-owned.
- Do not commit, push, dispatch a workflow, or deploy. Use `$deploy-wappalyzer` only when publication or rollout is explicitly requested.

## Load project context

- Read the root and `v4/frontend/` scoped project `AGENTS.md` files.
- Read [project-conventions.md](references/project-conventions.md) before implementation.
- Read [validation.md](references/validation.md) before running checks.
- Inspect the surrounding page, layout, components, and existing theme patterns before selecting an approach.
- Consult the official Vuetify 2 documentation when exact props, slots, breakpoint behavior, or accessibility semantics matter.

## Workflow

1. Identify the user flow and affected page, layout, shared component, data boundary, and responsive states.
2. Reuse the closest established project pattern. Preserve Nuxt 2 SSR and client hydration behavior.
3. Choose styling in this order:
   1. existing project pattern;
   2. Vuetify prop or slot;
   3. Vuetify helper class;
   4. existing theme token;
   5. global SASS variable for a genuinely global design decision;
   6. scoped component CSS for a local need the earlier options cannot express.
4. Avoid inline style attributes and DOM patching. A focused `<style scoped>` block is acceptable when it is the narrowest local solution; do not turn a local exception into a global token.
5. Use built-in component states, validation rules, activator slots, loading/disabled behavior, and accessibility semantics before custom plumbing.
6. Validate task files, responsive layouts, SSR/hydration, interaction states, and browser console behavior using [validation.md](references/validation.md).
7. Report what changed, checks run, viewports exercised, and any unverified state. Do not describe a push as a deployment.

## Defaults

- Build layout with the established Vuetify application shell and grid before custom wrappers.
- Prefer documented component variants, color props, spacing/display/typography helpers, and theme values over hard-coded CSS.
- Use `mdiSvg` through `v-icon`; icon-only actions need accessible names.
- Prefer `v-form` and component `rules`; prefer documented slots and events over listeners on generated internals.
- In data tables, customize individual columns before replacing whole headers/bodies; use `v-simple-checkbox` in table slots.
- Do not run a competing Nuxt build while the project dev server is active unless the user explicitly requests it.
