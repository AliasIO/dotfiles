# Global Instructions

Keep global Codex guidance intentionally minimal. Project-specific instructions live under `/Users/elbert/Sites/dotfiles/codex/projects/<project>/AGENTS.md` and are symlinked into each project root.

When the user asks a question such as "Can we..." or "Is it possible to...", provide a thoroughly considered answer and do not make code changes unless explicitly instructed.

For every completed implementation task in a Git repository, commit all requested changes and push them directly to the current upstream branch unless the user says otherwise. Do not leave requested work uncommitted or unpushed. Stage only task-related files, run relevant validation before committing, and verify that the remote branch contains the commit after pushing. Avoid creating pull requests or task branches. If isolation requires a temporary branch or worktree, automatically integrate its changes into the original delivery branch, push that branch, and clean up the temporary branch or worktree. Never force-push or include unrelated changes. Report only genuine blockers such as conflicts, missing permissions, or failed validation.

After making significant code changes, explicitly consider edge cases and gotchas in the final response. If more work should ideally be done, say what remains or what should be done next, especially after partial optimization or incremental hardening work.
