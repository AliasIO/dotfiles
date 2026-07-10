# Wappalyzer Project Instructions

## Authority and storage

- This file and every scoped `AGENTS.md` are canonical under `~/Sites/dotfiles/codex/projects/wappalyzer`. Workspace copies are symlinks declared in `agent-links.json` and managed by `scripts/manage-agent-links.js`; active skill discovery links are declared in `skill-links.json` and managed by `scripts/manage-skill-links.js`. Edit dotfiles sources, never symlink locations as independent copies.
- The workspace root is an aggregate directory, not a Git repository. Inspect, edit, validate, and commit from the owning repository such as `extension/`, `cli/`, `v4/apis-shared/`, `v4/apis/`, or `v4/frontend/`.
- Create worktrees per owning repository, never at the aggregate workspace root. For dependency propagation, use a clean worktree when ordinary parent changes would otherwise be affected.
- The nearest scoped `AGENTS.md` adds path-specific constraints. This root owns only cross-repository ownership, synchronization, authority, routing, and maintenance.
- Keep API credentials outside repositories. Wappalyzer test credentials belong in `~/.codex/secrets/wappalyzer-api.toml`.

## Canonical ownership

| Concern | Canonical source |
| --- | --- |
| Extension runtime, detection engine, technology definitions, and icons | `extension/` |
| CLI and browser crawler | `cli/` |
| Browserless single-URL crawler | `static/` |
| Shared API logic, AWS helpers, and extractor | `v4/apis-shared/` |
| API service packaging, infrastructure configuration, and deploy entrypoint | `v4/apis/` |
| Website | `v4/frontend/` |
| `extract/` aliases | Content from `v4/apis-shared/`; aliases are not another source |
| Declared submodule copies | Disposable consumers; never primary edit locations |

- Do not patch `cli/wappalyzer`, `static/wappalyzer`, `v4/apis/*/wappalyzer`, or `v4/apis/*/shared`. Make the change in the canonical repository and propagate its published commit.
- Keep `extract/shared.js`, `extract/linkedin.js`, `extract/diallingcodes.json`, and `extract/extract.js` byte-identical to their `v4/apis-shared/` sources. Symlink or hardlink identity is preferred where present, but content equality is the required invariant.

## Dependency synchronization

- Canonical repositories are protected. Declared consumer submodule checkouts and their parent gitlinks are synchronization artifacts and may be reset, detached, or replaced to match the published canonical revision.
- Discard authority is strictly limited to consumer paths and their exact parent gitlinks declared by the `deploy-wappalyzer` dependency manifest. Never discard, absorb, commit, or stage unrelated changes in a canonical repository or ordinary parent files.
- Publish bottom-up: `extension` first; then any `cli` gitlink update; then every parent that records `cli` or `v4/apis-shared`. A consumer must never point to an unpublished or branch-only commit.
- Use `$HOME/Sites/dotfiles/codex/skills/deploy-wappalyzer/scripts/sync-dependencies.mjs`. Run `--check` before and after propagation; use `--apply` only with Publish authority. The script may replace declared consumer dirt, but it stages only exact gitlinks or extractor-alias paths and never commits, pushes, or deploys.
- Commit and publish each dependency layer before propagating the next layer. Never use `git add -A` for propagation commits.
- Propagation is complete only when every declared consumer resolves to the intended published commit and the extractor alias audit passes. Once publication of a dependency change is authorized, updating every declared consumer is part of that publication—not optional follow-up work.
- Remote publication and live deployment remain separate actions. A synchronized local checkout is not a deployed service.

## Authority modes

| Mode | Permitted work |
| --- | --- |
| Inspect | Read-only checks, research, diagnosis, and reporting; validators may create disposable ignored output but may not alter tracked, live, or pre-existing state |
| Implement | Local task-owned edits and validation; no commit, push, PR, GitHub mutation, deploy, release, or live-system mutation |
| Publish | Explicitly requested commits, pushes, PRs, issue actions, and required dependency propagation |
| Operate | Explicitly requested deploys, releases, Batch start/resume/cancel, or other live-system mutation |

- Questions, reviews, issue URLs, status checks, and diagnosis default to Inspect. “Fix” or “implement” selects Implement unless publication is also requested. “Open a PR”, “process the backlog”, or equivalent selects Publish. A live operation must be requested explicitly.
- Never deploy `v2`, or deploy a non-production stack capable of mutating a shared live resource, without explicit permission in the current task. Cognito-trigger services attached to the shared user pool are production-impacting at every stage.
- Do not broaden authority because a workflow normally continues into another mode. Report the next step when it is not authorized.

## Routing

| Task | Canonical instructions |
| --- | --- |
| Technology research, definition changes, metadata, icons, and detection validation | `$add-wappalyzer-technology` |
| Detection issue intake, classification, implementation, PRs, labels, comments, and closure | `$handle-wappalyzer-detection-issues` |
| Dependency propagation and API/frontend deployment | `$deploy-wappalyzer` |
| Mass-lookup status, operation, repair, and troubleshooting | `$operate-wappalyzer-mass-lookup` |
| Extension readiness, preparation, and release | `$release-wappalyzer-extension` |
| Nuxt 2 / Vuetify 2 frontend implementation | `$wappalyzer-frontend` |
| Crisp conversation inspection | `$inspect-crisp-conversation` |

- Path invariants live in `scopes/<path>/AGENTS.md`. Mutable or externally managed operational facts live in `runbooks/` and must be verified before use.
- A skill owns its workflow. Do not restate its detailed procedure in an `AGENTS.md` file.

## Instruction maintenance

- Add an instruction only when it is durable, non-obvious, recurring, and changes future work. Put enforceable behavior in tests or configuration first and retain only the concise invariant here.
- Keep one canonical statement per rule: path invariants in the nearest scoped `AGENTS.md`, task procedures in skills, mutable live state in runbooks, and incident history in Git history.
- Operational runbooks must state owner, verification status, source of truth, and a discovery command or method. Query generated IDs, revisions, schedules, quotas, and billing modes at execution time rather than treating prose as live state.
- Edit instruction and skill sources only under `~/Sites/dotfiles`. For authorized documentation work, validate and commit only task-owned dotfiles changes. Commit, push, and deployment still require the corresponding authority mode.
- Restore the repository’s starting branch when practical; never force an unrelated checkout back to `master`.
- Remove superseded copies in the same documentation change. Do not create permanent staging or legacy copies; use Git history as the archive.
