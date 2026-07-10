# Project Instructions

- Start implementation work from `origin/master` in an isolated Git worktree on an `agent/<short-description>` branch.
- Preserve unrelated local edits. Before committing, stage only task-owned files or hunks and inspect the staged diff.
- Run `npm run build` after code or infrastructure edits and before committing. Run `npm run diff` when CDK behavior changes.
- After validation, commit task-owned changes, push the task branch, and open a draft pull request. Never push directly to `master`; require the `TypeScript and CDK` CI check before merging. Treat `master` as protected by policy even when the repository's GitHub plan cannot enforce branch protection.
- A branch push or merge does not deploy Alias.io. Production deployment uses the manual `Deploy` GitHub Actions workflow from `master`, its `production` environment, and the repository's OIDC-bound `AWS_DEPLOY_ROLE_ARN`; dispatch it only when the user explicitly authorizes deployment in the current request.
- Do not deploy, invalidate caches, or otherwise mutate production infrastructure unless the user explicitly asks in the current request.
- For authorized AWS work, use `AWS_PROFILE=alias.io AWS_REGION=us-east-1`. The profile must resolve to account `799414939380` through an assumed role whose name contains `AliasIo`; never use the default profile or AWS root credentials. Stop before any mutation if the identity check fails.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Sites/dotfiles/codex/projects/alias.io/AGENTS.md`; the repository-root file is a symlink.
