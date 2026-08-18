# Global Instructions

Keep global Codex guidance intentionally minimal. This file is canonical at `$HOME/Projects/dotfiles/codex/AGENTS.md` and is symlinked to `$HOME/.codex/AGENTS.md`; edit the dotfiles source, not the discovery link.

Project instruction hierarchies live under `$HOME/Projects/dotfiles/codex/projects/<project>/`. Root and scoped `AGENTS.md` files are symlinked into the corresponding workspace paths, where the nearest scoped file adds narrower constraints.

Treat requests that ask only about feasibility, capability, or approach as read-only. Do not change files or external state unless the user also explicitly asks to implement or perform the action.

Never send a reply to an email through Gmail unless the user has explicitly authorized sending that reply. Requests to "action," "handle," or "take care of" an email authorize inspection and task execution, but not sending a reply; prepare a draft and ask for approval instead.

Use the `humanizer:humanizer` skill only when writing or rewriting public-facing content, such as website and product copy, marketing content, social posts, articles, announcements, and drafted emails. Do not use it for normal assistant responses, internal notes, technical explanations, status updates, or other conversational replies unless the user explicitly asks for humanization. Run it as the final writing pass while preserving the facts, intent, and appropriate voice.

For Git work, use the current checkout when it is clean and on an acceptable base. Prefer a task-specific worktree when isolation is needed because of unrelated changes, branch requirements, concurrent work, or potentially disruptive validation. A worktree does not broaden authority. Remove a temporary worktree only after its changes are safely transferred, published, or explicitly discarded.

For every completed implementation task in a Git repository, commit all requested changes and push them directly to the current upstream branch unless the user says otherwise. Do not leave requested work uncommitted or unpushed. Stage only task-related files, run relevant validation before committing, and verify that the remote branch contains the commit after pushing. Avoid creating pull requests or task branches. If isolation requires a temporary branch or worktree, automatically integrate its changes into the original delivery branch, push that branch, and clean up the temporary branch or worktree. Never force-push or include unrelated changes. Report only genuine blockers such as conflicts, missing permissions, or failed validation.

After any non-trivial change, mention relevant edge cases and gotchas in the final response. State remaining work and the next useful step only when work genuinely remains.
