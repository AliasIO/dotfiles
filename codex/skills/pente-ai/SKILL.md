---
name: pente-ai
description: Improve, debug, and regression-check the Pente iOS app's advanced single-player computer AI. Use when Codex is asked to analyze a game the human won against the computer, inspect AI reasoning logs, tune Pente tactics such as open threes/trias, stretched fours/tesseras, extensions, keystone captures, capture races, forks, or update `PenteAI.swift`, `PenteEngine.swift`, `PenteEvaluator.swift`, or `AIGameStore.swift`.
---

# Pente AI

## Overview

Use this skill for advanced single-player AI work in `/Users/elbert/Sites/pente`. Treat the task as tactical forensics first, then implement small symmetric attack/defense improvements without weakening existing defenses or blowing the hard difficulty time budget.

## Core Workflow

1. Read the relevant repo files before changing behavior:
   - `Pente/PenteAI.swift`: move selection, shortcut ordering, search, DEBUG decision logs.
   - `Pente/PenteEngine.swift`: player-relative tactical detectors and move generation.
   - `Pente/PenteEvaluator.swift`: symmetric static scoring.
   - `Pente/AIGameStore.swift`: single-player state, simulator JSONL logs, saved games.

2. Load the detailed references only as needed:
   - For Pente concepts and tactical priorities, read `references/strategy.md`.
   - For code paths, simulator commands, and log formats, read `references/codebase.md`.
   - Before analyzing or patching AI behavior, read `references/analysis-log.md` and treat it as a regression checklist.

3. If debugging a human win against the computer, start from evidence:
   - Build/run the debug app on the active simulator if needed.
   - Locate logs with `xcrun simctl get_app_container booted io.alias.pente data`.
   - Summarize logs with `scripts/pente_ai_log_summary.py --device booted --latest --reverse`.
   - Inspect `AI_DECISION_LOG` / `AI_GAME_LOG` console output when reproducing live.

4. Analyze from the end backward:
   - Start at the terminal human-winning move.
   - Step backward through committed moves and AI decision events until the side to move had no plausible defense against the winning sequence.
   - Keep going backward to find the earlier computer move that first allowed that unwinnable position.
   - Distinguish "already lost, no defense existed" from "defense existed but was not generated, ranked, searched, or selected."
   - When a credible code-level solution is identified, implement it in the app in the same turn unless the user explicitly asked for analysis only or the fix is still speculative.

5. Patch narrowly and symmetrically:
   - Prefer player-relative helpers in `PenteEngine` so the same pattern supports computer attack and human-threat defense.
   - Use the detector in candidate generation, shortcut attack paths, forced defense paths, and evaluation/order scoring as appropriate.
   - Add the new behavior alongside existing defenses. Do not "fix" one tactical failure by simply demoting another already-working defense.
   - Do not hand back only a diagnosis after finding the missing detector, ordering guard, or tactical scoring rule; patch the code, validate the specific board, and record the regression probe.

6. Validate behavior and time:
   - Rebuild and run the simulator after app code changes.
   - Always reload/relaunch the simulator app after a code change and reopen or restart the single-player game so the user can continue testing against the latest build.
   - Check the relevant AI decision log for selected reason, candidate groups, missed candidate tags, phase timings, and `exceededDeadline`.
   - Run the compact-board regression bench so a local fix does not reintroduce an older tactical failure.
   - Keep hard AI response time practical. Current hard config is `maxDepth: 6`, `timeLimitMs: 4_000`, `maxCandidateMoves: 20`; expensive shortcuts must cap candidates and respect `shouldStop()`.

7. Preserve learnings:
   - After each game analysis, append a concise entry to `references/analysis-log.md`.
   - Include the date, game id when available, symptom, root cause, fix or decision, and any regression probe that should be reused.
   - If a durable lesson changes how future analyses should be run, update this skill in the same turn.

## Parallel Debugging With Subagents

When subagent use is permitted or has been authorized for a Pente AI debugging/fixing pass, use it whenever it is likely to shorten the investigation. Split independent work while keeping the main agent on the critical path:

- Main agent: pull the latest simulator logs, identify the suspect move sequence, own the final code patch, run final validation, update the analysis log, and commit.
- Explorer 1: reconstruct the suspect board from logs and report tactical facts only: active threats, capture vulnerabilities, expected move, candidate groups, and compact board.
- Explorer 2: inspect the relevant `PenteAI.swift` / `PenteEngine.swift` paths and compare the failure against `references/analysis-log.md`.
- Worker/verifier: run focused probes and prior regression probes while the main agent integrates the fix.

Prefer delegating bounded read-only analysis or probe execution. Keep edits in one place unless the fix naturally has disjoint file ownership.

## Reverse-Loss Analysis

When the user says they beat the advanced computer, do this before coding:

1. Identify the `gameId` and final winner from `ai-game-log.jsonl`.
2. Print the reverse timeline and AI decision summaries.
3. For each computer move in reverse order, inspect:
   - `reason`, `selected`, `durationMs`, `phases`, and `groups`.
   - Whether the selected move was a legal defense but insufficient.
   - Whether a better defensive move appeared in a candidate group but lost in ordering/search.
   - Whether the needed move never appeared in any tactical group or root search.
4. Reconstruct the board before the suspect AI move from `decision.board` or the matching `aiMoveCommitted.before`.
5. Confirm the tactical failure with `PenteEngine` helpers, not by visual intuition only.
6. Continue one or more ply earlier when the current position was already losing.

The target fix is usually the first earlier computer move where a player-relative detector should have generated, preferred, or searched a move that both handled the human threat and advanced the computer's own forcing plan.

Before finalizing a diagnosis or patch, compare the suspected failure against `references/analysis-log.md`; repeated patterns such as shortcut deadline fallback, compound-defense preemption, and capture-refuted blocks should be tested explicitly.

If the reverse analysis identifies a non-speculative implementation fix, apply it before final response. Only stop at analysis when the user explicitly asks for no code changes or when the evidence does not yet support a concrete patch.

## Implementation Rules

- Make tactical detectors player-relative: `for player: Int8, in state: AIState`.
- Keep attack/defense symmetry: every new defense concept should have an equivalent attacking use unless there is a concrete reason it cannot.
- Prefer additive tactical buckets and ordering terms over broad reprioritization.
- Guard against capture refutations: open-three, stretch-four, and fork moves are not good if the played stone or key support stones can be captured immediately into a loss.
- Avoid global legal-move scans in normal paths. Use neighborhood/contact candidates, prefix limits, cached summaries, and early exits.
- Log new tactical groups in DEBUG so future regressions are inspectable.
- Preserve existing public behavior and opening rules.

## Validation

Use the XcodeBuildMCP iOS workflow when app code changes:

- `session_show_defaults`
- `list_sims` and choose the booted simulator, or boot/open one if explicitly requested.
- `list_schemes` for `Pente.xcodeproj`.
- `session_set_defaults` with project, scheme `Pente`, simulator, configuration `Debug`, and bundle id `io.alias.pente`.
- `build_run_sim`
- For fresh Advanced single-player testing, prefer launching with the debug shortcut argument `-PenteDebugStartSinglePlayer` after the build. It jumps straight into a new single-player game with Advanced difficulty, Tournament rules, and Player starting, avoiding menu navigation with Computer Use.
- After `build_run_sim`, leave the simulator ready for manual testing: use the debug launch shortcut when starting a fresh game; use Computer Use only as a fallback when you need to inspect or control an already-open simulator UI.
- `snapshot_ui` / `screenshot` for screen state.
- `start_sim_log_cap` with `captureConsole: true`, reproduce, then `stop_sim_log_cap`.

There are no dedicated AI unit tests in the repo currently; use compile/build, simulator logs, targeted reproduced games, and code-level tactical probes as the validation surface.

Run the recorded compact-board regression bench after Pente AI code changes:

```bash
swiftc Pente/PenteAI.swift Pente/PenteEngine.swift Pente/PenteEvaluator.swift Scripts/PenteAIRegressionBench/main.swift -o /tmp/pente_ai_regression_bench && /tmp/pente_ai_regression_bench
```

When a probe covers a durable regression, record the compact board, expected move, and selected reason in `references/analysis-log.md` so future changes can reuse it.

## Bundled Script

Run:

```bash
python3 /Users/elbert/Sites/dotfiles/codex/skills/pente-ai/scripts/pente_ai_log_summary.py --device booted --latest --reverse
```

Use `--game-id <id>` for a specific game and `--show-board` when a text board helps.
