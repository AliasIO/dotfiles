# Pente AI Codebase And Debugging Reference

## Repo Map

- `/Users/elbert/Projects/pente/Pente/PenteAI.swift`
  - `AIDifficulty.hard.config`: `maxDepth: 6`, `timeLimitMs: 4_000`, `maxCandidateMoves: 20`, advanced shortcuts on.
  - `PenteAI.chooseMove`: wraps `Searcher.bestMove()`.
  - `Searcher.bestMove()`: shortcut order, forced defenses, compound threats, shortcut/full negamax, DEBUG decision logging.
  - DEBUG decision-log schema 4 includes `groups`, `phases`, `candidates`, `selected`, `reason`, `durationMs`, root `board`, and `searchTelemetry`.
  - `searchTelemetry` records negamax/quiescence nodes, evaluated root moves, completed depth by search label, transposition probes/misses/score hits/move-ordering hits/stores, alpha-beta cutoffs, and deadline/cancellation exit reasons.

- `/Users/elbert/Projects/pente/Pente/PenteEngine.swift`
  - Board: 19x19, `AIState.board` has `-1` empty, `0` human/white, `1` computer/black in single player.
  - Move helpers: `aiIndex`, `aiCoordinates`, `aiOpponent`.
  - Core application: `apply`, `capturePreviewPositions`, `capturePreviewCount`, `immediateWinningMoves`. `capturePreviewIndices` is private and should not be treated as a callable helper outside `PenteEngine`.
  - Tactical detectors: forced line/capture/pair defenses, open-three defenses, open-four creation, fork setup, capture threat summaries, move qualities.

- `/Users/elbert/Projects/pente/Pente/PenteEvaluator.swift`
  - Static scoring is mostly player-relative, but immediate opponent wins carry an intentional stronger defensive penalty than the corresponding attacking bonus.
  - Keep new feature terms symmetric unless intentionally modeling defensive urgency or another documented turn-specific risk.

- `/Users/elbert/Projects/pente/Pente/AIGameStore.swift`
  - Owns single-player state, saved sessions, human moves, AI turn tasks, hints, and debug logs.
  - DEBUG files in app Documents:
    - `ai-game-log.jsonl`: session, pending moves, committed human/AI moves, board snapshots.
    - `ai-decision-log.jsonl`: AI search reasoning, candidate groups, selected move, phase timings.

## Simulator Workflow

Locate the current app data container with:

```bash
xcrun simctl get_app_container booted io.alias.pente data
```

The logs are under:

```text
<container>/Documents/ai-game-log.jsonl
<container>/Documents/ai-decision-log.jsonl
```

When current XcodeBuildMCP tools are available:

1. `session_show_defaults`
2. `list_sims` and choose a booted simulator, usually iPhone 17 in this workspace.
3. `list_schemes` with `/Users/elbert/Projects/pente/Pente.xcodeproj`; scheme is `Pente`.
4. `session_set_defaults` with project, scheme, simulator, `configuration: Debug`, `bundleId: io.alias.pente`.
5. Use `build_run_sim`, or build and then `launch_app_sim` with `launchArgs: ["-PenteDebugStartSinglePlayer"]` for a fresh Advanced game.
6. Read the runtime/OS log paths returned by the build or launch result. Current XcodeBuildMCP versions capture those logs directly; do not call obsolete `start_sim_log_cap` or `stop_sim_log_cap` tools.
7. Reload/relaunch after every code change and leave a newly opened or restarted single-player game ready for manual testing.

When XcodeBuildMCP is unavailable, target the active simulator by UDID and use a fixed derived-data directory:

```bash
SIMULATOR_UDID=<booted-simulator-udid>
DERIVED_DATA_PATH=/tmp/PenteDerivedData

xcodebuild build -project Pente.xcodeproj -scheme Pente -configuration Debug -destination "platform=iOS Simulator,id=${SIMULATOR_UDID}" -derivedDataPath "$DERIVED_DATA_PATH"
xcrun simctl install "$SIMULATOR_UDID" "$DERIVED_DATA_PATH/Build/Products/Debug-iphonesimulator/Pente.app"
xcrun simctl launch --terminate-running-process "$SIMULATOR_UDID" io.alias.pente -PenteDebugStartSinglePlayer
```

Use `xcrun simctl list devices booted` to identify the active UDID. If none is active and app verification is required, boot/open the standard iPhone 17 simulator first.

Project instruction: after iOS app code changes, rebuild and run the active simulator, reload the app, and leave a freshly opened/restarted game ready before handing work back.

## Log Forensics

Use the bundled script for the latest completed human win:

```bash
python3 /Users/elbert/Projects/dotfiles/codex/skills/pente-ai/scripts/pente_ai_log_summary.py --device booted --latest-human-win --reverse --show-board
```

A typical AI decision maps to the following committed AI move by `gameId` and `moveNumber`.

Key fields:

- `reason`: shortcut/search path that selected the move.
- `groups`: tactical buckets the move appeared in.
- `candidates`: per-move tags and search scores.
- `phases`: timings and `exceededDeadline` flags; long phases identify compute risks.
- `searchTelemetry`: node counts, completed depths, cache behavior, cutoffs, and the first recorded deadline/cancellation exit context.
- `board`: board before the AI move.
- `selected`: AI move.

## Pinned Version Bench

`Scripts/pente_ai_version_bench.py` compares the current working tree with the immutable Git revision in `Scripts/PenteAIVersionBench/baseline.json`. It compiles each version as a persistent move oracle, starts paired games from the same fixed histories, swaps player indexes, and reports win plus latency summaries.

Canonical Advanced-budget run:

```bash
python3 Scripts/pente_ai_version_bench.py \
  --games 12 \
  --max-moves 60 \
  --time-limit-ms 4000 \
  --max-seconds 1800 \
  --jsonl /tmp/pente-ai-version-bench.jsonl
```

Use `--baseline-ref <commit>` only for an intentional one-off comparison. Promote a new baseline by updating the pinned full commit and label after the candidate has passed focused probes, the compact bench, and a meaningful paired run.

## Reverse Human-Win Debugging

1. Confirm the final `winner` in `ai-game-log.jsonl`.
2. Walk committed moves backward from the final human win.
3. For each AI move:
   - Match its `ai-decision-log.jsonl` event.
   - Inspect whether the winning human threat was already unavoidable.
   - Check if a known defensive bucket generated the needed move.
   - Check if the needed move was absent due to detector/candidate-generation failure.
   - Check if it was present but ranked below a move that allowed a stronger threat.
4. Keep walking backward until you find the first AI move where a different available move would have kept the game defensible.
5. For read-only requests, report the detector/order/search diagnosis without editing.
6. When implementation is authorized, patch that tactical class and re-run the same game position or replay path to verify the log reason/candidates changed as intended.

## Compute-Time Rules

- Do not add broad full-board scans in normal advanced shortcuts unless capped tightly.
- Prefer neighborhood candidates, direct threat moves, and existing tactical buckets.
- Add `shouldStop()` checks inside loops in `PenteAI.Searcher`.
- Prefix reply checks and tactical scoring with `maxShortcutRootMoveCount` / `maxShortcutReplyAssessmentCount`-style limits.
- Watch DEBUG `phases`: a phase exceeding the 4 second hard budget must be optimized or gated.
