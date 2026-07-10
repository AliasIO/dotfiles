# Project Instructions

- Do not create new branches; work on `master`.
- Preserve unrelated local edits. Before committing, stage only task-owned files or hunks and inspect the staged diff.
- Run `npm run build` after code or infrastructure edits and before committing. Run `npm run diff` when CDK behavior changes.
- After validation, commit task-owned changes and push them to `origin/master`.
- A Git push does not deploy Alias.io; this repository has no GitHub deployment workflow.
- Do not deploy, invalidate caches, or otherwise mutate production infrastructure unless the user explicitly asks in the current request.
- For authorized AWS work, use `AWS_PROFILE=alias.io AWS_REGION=us-east-1`. The profile must resolve to account `799414939380` through an assumed role whose name contains `AliasIo`; never use the default profile or AWS root credentials. Stop before any mutation if the identity check fails.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Sites/dotfiles/codex/projects/alias.io/AGENTS.md`; the repository-root file is a symlink.
