---
name: pente-ai
description: Analyze, debug, implement, and regression-check the Pente iOS app's advanced single-player AI. Use for human wins against the computer, AI reasoning logs, open threes/trias, stretched fours/tesseras, extensions, keystone captures, capture races, forks, or changes to `PenteAI.swift`, `PenteEngine.swift`, `PenteEvaluator.swift`, and `AIGameStore.swift`.
---

# Pente AI

Work in `/Users/elbert/Sites/pente`. Start with tactical evidence and preserve the Advanced 4-second response budget.

## Respect The Requested Scope

- Treat requests to analyze, inspect, explain, review, or diagnose as read-only. Reconstruct the loss and report the first avoidable AI move without editing code, the skill, the history, or Git state.
- Implement only when the user asks to fix, tune, change, update, or otherwise authorizes code changes.
- Modify this skill or its dotfiles references only when the user explicitly asks to maintain the skill or regression documentation.
- Commit or push only when the applicable project instructions or the user explicitly require it.

## Load Context Progressively

1. Read only the relevant repo files:
   - `Pente/PenteAI.swift`: move selection, shortcut ordering, search, and DEBUG decision logs.
   - `Pente/PenteEngine.swift`: player-relative tactical detectors and move generation.
   - `Pente/PenteEvaluator.swift`: mostly player-relative static scoring with intentional defensive-urgency asymmetry.
   - `Pente/AIGameStore.swift`: single-player state, simulator JSONL logs, and saved games.
2. Read `references/codebase.md` for paths, simulator commands, and log fields.
3. Read `references/strategy.md` only when game concepts need clarification.
4. Before implementation, read `references/regressions.md`.
5. Search `references/analysis-log.md` for a matching motif; do not load the full chronological archive by default.

## Select The Correct Game Before Relaunching

For a reported human win, identify and record the completed game id before rebuilding, relaunching, or starting another game:

```bash
python3 /Users/elbert/Sites/dotfiles/codex/skills/pente-ai/scripts/pente_ai_log_summary.py --device booted --latest-human-win --reverse
```

Use `--list-games` if no human win is found. After identifying the game, use `--game-id <id>` for every summary, export, fixture, and triage command. Never assume a newly started session is the target loss.

## Reverse-Loss Analysis

1. Confirm the selected `gameId`, final winner, and terminal human move.
2. Walk committed moves backward and match each computer move to its decision event.
3. Reconstruct the board before each suspect AI move.
4. Check whether a viable defense existed and whether it was absent from generation, lost in ordering/search, or discarded at the deadline.
5. Continue earlier when the current position was already lost.
6. Confirm tactical facts with `PenteEngine` helpers or the tactical probe rather than visual intuition alone.
7. For read-only requests, report the diagnosis and proposed fix without changing files.

## Implementation Rules

- Make tactical detectors player-relative and preserve attack/defense symmetry unless a concrete asymmetry is required.
- Prefer additive tactical buckets and ordering terms over broad reprioritization.
- Guard open-three, stretch-four, fork, and counter-threat moves against immediate and delayed capture refutations.
- Keep broad forced-threat solvers behind concrete immediate-win, capture, fork, and open-four work.
- Avoid global legal-move scans in normal paths. Cap candidates, cache summaries, add early exits, and honor `shouldStop()`.
- Preserve urgent detected responses when a reply probe reaches the deadline instead of falling through to a softer fallback.
- Log new tactical groups in DEBUG and preserve opening/public behavior.

## Validation

Run the compact regression bench from `references/regressions.md` serially after AI behavior changes. Do not run it beside pressure or exploit batches because CPU contention can create false deadline failures.

There are no dedicated AI unit tests. Use the compact bench, focused tactical probes, simulator logs, and a rebuilt Debug app. Use headless pressure/exploit tools for volume; use the simulator for captured games and manual play.

### Simulator

Use XcodeBuildMCP only when its current build/run tools are available. Its build/run results include runtime log paths; do not call obsolete log-capture tools. Otherwise use the CLI fallback in `references/codebase.md`.

For a fresh Advanced game, launch with `-PenteDebugStartSinglePlayer`. After app code changes, install and relaunch the newest build and leave the simulator ready for manual testing.

### Log and fixture helpers

```bash
python3 Scripts/pente_ai_export_game.py --device booted --game-id <id> --output-dir /tmp/pente-ai-game --emit-fixture --show-board
python3 Scripts/pente_ai_fixture_from_log.py --device booted --game-id <id> --move-number <n> --expected <x,y> --name "<failure>" --show-board
python3 Scripts/pente_ai_triage_game.py --device booted --game-id <id> --work-dir /tmp/pente-ai-triage --run-exploit
```

The triage tool defaults to the latest completed human win when `--game-id` is omitted. Pass `--latest` only when intentionally analyzing the latest non-terminal or computer-winning game with committed moves.

### Tactical probe

Compile and inspect its supported flags:

```bash
swiftc Scripts/PenteAISupport/Support.swift Pente/PenteOpeningBookData.swift Pente/PenteOpeningBook.swift Pente/PenteAI.swift Pente/PenteEngine.swift Pente/PenteEvaluator.swift Scripts/PenteAITacticalProbe/main.swift -o /tmp/pente_ai_tactical_probe
/tmp/pente_ai_tactical_probe --help
/tmp/pente_ai_tactical_probe --board "<361-character-board>" --turn 1 --captures 0,0 --last 9,8 --moves "8,7;10,9" --scan
```

### Pressure and long runs

Use `Scripts/PenteAIPressureBench`, `Scripts/PenteAIExploitBench`, and `Scripts/pente_ai_long_run.py` only after focused reproduction. Treat findings as hypotheses until the tactical probe confirms the root was defensible and the suggested move handles higher-priority threats. Treat low-budget timeout warnings as noise unless they reproduce near 4 seconds.

## Record Authorized Learnings

When regression-documentation changes are in scope:

1. Add or update an executable compact-board fixture.
2. Update `references/regressions.md` with the durable invariant or fixture name.
3. Append only a concise historical note to `references/analysis-log.md` when chronology adds value.

Include the date, game id, symptom, root cause, decision/fix, and executable regression probe. Do not record temporary paths as canonical commands.
