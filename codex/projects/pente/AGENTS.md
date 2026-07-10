# Project Instructions

## Git Workflow

- Treat analysis-only work as read-only. When implementation is authorized, start from `origin/master` in an isolated Git worktree on an `agent/<short-description>` branch.
- Preserve unrelated local edits. Stage and commit only task-owned files, push the task branch, and open a draft pull request. Never push directly to protected `master`.
- Require the `App and AI regressions` CI check before merging. Keep deployment or release work separate from branch pushes and merges.

## Simulator Workflow

- After making iOS app code changes, rebuild and run the active simulator before handing work back so the installed app is ready for manual testing.
- Use XcodeBuildMCP only when its build/run tools are actually available. Otherwise build with `xcodebuild` against the booted simulator UDID and a fixed derived-data path, install the resulting `Pente.app` with `xcrun simctl install`, and launch bundle id `io.alias.pente` with `xcrun simctl launch`.
- Pass `-PenteDebugStartSinglePlayer` as a launch argument when a fresh Advanced single-player game is needed. Current XcodeBuildMCP builds capture runtime logs directly; do not call obsolete `start_sim_log_cap` or `stop_sim_log_cap` tools.
- When controlling the Simulator UI, prefer Computer Use when available. Use XcodeBuildMCP taps/gestures only when those tools exist; otherwise leave visual interaction to the user rather than inventing unavailable automation.
- If no simulator is active and app verification is required, boot/open the standard `iPhone 17` simulator before building.
- If editing this `AGENTS.md`, make the canonical change in `/Users/elbert/Sites/dotfiles/codex/projects/pente/AGENTS.md`; the repository-root file is a symlink.
