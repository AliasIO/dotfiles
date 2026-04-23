# Pente AI Codebase And Debugging Reference

## Repo Map

- `/Users/elbert/Sites/pente/Pente/PenteAI.swift`
  - `AIDifficulty.hard.config`: `maxDepth: 6`, `timeLimitMs: 4_000`, `maxCandidateMoves: 20`, advanced shortcuts on.
  - `PenteAI.chooseMove`: wraps `Searcher.bestMove()`.
  - `Searcher.bestMove()`: shortcut order, forced defenses, compound threats, shortcut/full negamax, DEBUG decision logging.
  - DEBUG logs include `groups`, `phases`, `candidates`, `selected`, `reason`, `durationMs`, and root `board`.

- `/Users/elbert/Sites/pente/Pente/PenteEngine.swift`
  - Board: 19x19, `AIState.board` has `-1` empty, `0` human/white, `1` computer/black in single player.
  - Move helpers: `aiIndex`, `aiCoordinates`, `aiOpponent`.
  - Core application: `apply`, `capturePreviewIndices`, `immediateWinningMoves`.
  - Tactical detectors: forced line/capture/pair defenses, open-three defenses, open-four creation, fork setup, capture threat summaries, move qualities.

- `/Users/elbert/Sites/pente/Pente/PenteEvaluator.swift`
  - Static score is symmetric: add computer/player features and subtract opponent features.
  - Keep new scores symmetric unless intentionally modeling turn-specific risk.

- `/Users/elbert/Sites/pente/Pente/AIGameStore.swift`
  - Owns single-player state, saved sessions, human moves, AI turn tasks, hints, and debug logs.
  - DEBUG files in app Documents:
    - `ai-game-log.jsonl`: session, pending moves, committed human/AI moves, board snapshots.
    - `ai-decision-log.jsonl`: AI search reasoning, candidate groups, selected move, phase timings.

## Simulator Workflow

Use the build-ios-apps debugger flow:

```bash
xcrun simctl get_app_container booted io.alias.pente data
```

The logs are under:

```text
<container>/Documents/ai-game-log.jsonl
<container>/Documents/ai-decision-log.jsonl
```

With XcodeBuildMCP:

1. `session_show_defaults`
2. `list_sims` and choose a booted simulator, usually iPhone 17 in this workspace.
3. `list_schemes` with `/Users/elbert/Sites/pente/Pente.xcodeproj`; scheme is `Pente`.
4. `session_set_defaults` with project, scheme, simulator, `configuration: Debug`, `bundleId: io.alias.pente`.
5. `build_run_sim`.
6. Reload/relaunch the simulator app after every code change, then reopen or restart the single-player game so manual testing continues against the newest build. If already in a game, use the `Reset game` toolbar button; otherwise navigate into `Single player` and choose the intended difficulty/opening.
7. `snapshot_ui` and `screenshot`.
8. `start_sim_log_cap` with `captureConsole: true`; reproduce; `stop_sim_log_cap`.

Project instruction: after iOS app code changes, rebuild and run the active simulator, reload the app, and leave a freshly opened/restarted game ready before handing work back.

## Log Forensics

Use the bundled script:

```bash
python3 /Users/elbert/Sites/dotfiles/codex/skills/pente-ai/scripts/pente_ai_log_summary.py --device booted --latest --reverse --show-board
```

A typical AI decision maps to the following committed AI move by `gameId` and `moveNumber`.

Key fields:

- `reason`: shortcut/search path that selected the move.
- `groups`: tactical buckets the move appeared in.
- `candidates`: per-move tags and search scores.
- `phases`: timings and `exceededDeadline` flags; long phases identify compute risks.
- `board`: board before the AI move.
- `selected`: AI move.

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
5. Implement a detector/order/search fix for that specific tactical class.
6. Re-run the same game position or replay path and verify the log reason/candidates changed as intended.

## Compute-Time Rules

- Do not add broad full-board scans in normal advanced shortcuts unless capped tightly.
- Prefer neighborhood candidates, direct threat moves, and existing tactical buckets.
- Add `shouldStop()` checks inside loops in `PenteAI.Searcher`.
- Prefix reply checks and tactical scoring with `maxShortcutRootMoveCount` / `maxShortcutReplyAssessmentCount`-style limits.
- Watch DEBUG `phases`: a phase exceeding the 4 second hard budget must be optimized or gated.
