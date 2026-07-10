# Frontend Validation

## Preflight

1. Inspect `git status --short` and preserve unrelated edits.
2. Check whether the frontend dev server is already running. Reuse it; do not launch a competing build/server.
3. Identify the smallest set of changed JS/Vue files and user flows.

## Static checks

Run non-fixing ESLint on task files from `$HOME/Sites/wappalyzer/v4/frontend`:

```bash
yarn eslint --ext .js,.vue --ignore-path .gitignore <changed-files...>
```

The repository `yarn lint` script includes `--fix`; do not use it as a read-only validator unless formatting mutations are intended and scoped.

Do not run an in-place production build in Inspect mode. `nuxt build` rewrites ignored `.nuxt` state and may replace a pre-existing developer build that Git cannot detect. If build behavior matters during an Inspect-only task, report the skipped check unless it can run in a fully isolated disposable checkout and cache that will be removed in the same turn.

In Implement mode, if no dev server is active, the change affects SSR, configuration, routing, or build-time behavior, and `.nuxt` is absent or known to be task-created, run:

```bash
yarn build
```

Otherwise use an isolated disposable checkout/cache or report the build as skipped. Treat task-created build output as disposable validation state, never remove or replace unrelated output, and confirm the tracked worktree is unchanged afterward. Do not run `yarn deploy:*` for validation.

## Browser checks

- Exercise at least one representative desktop and narrow/mobile viewport.
- Check loading, empty, success, error, disabled, validation, menu/dialog, and keyboard/focus states that the change touches.
- Reload the route directly to exercise server render, then navigate client-side to exercise hydration and routing.
- Inspect browser console and network failures; treat hydration warnings as failures to investigate.
- Confirm no layout clipping, unexpected horizontal scroll, inaccessible icon-only actions, or focus loss.

## Report

- List exact commands and results.
- Name the routes and viewport sizes checked.
- State whether SSR/direct reload and client navigation were both exercised.
- Call out checks skipped because the dev server, credentials, data, or environment was unavailable.
