# Pente AI Analysis Log

Persistent learnings from advanced single-player loss analysis. Read this before diagnosing or patching AI behavior, and append a new entry after each game analysis.

## Entry Format

- Date:
- Game:
- Symptom:
- Root cause:
- Fix or decision:
- Regression probe:

## 2026-04-24 - Delayed fork setup after soft defense

- Game: earlier human win, move-12 probe after human `(6,8)`.
- Symptom: computer picked a plausible fork-defense move but allowed a delayed fork setup that became forcing later.
- Root cause: soft fork defense ordering only looked at immediate reply risk; it missed opponent replies that first force an answer and then create multiple open-four creation points.
- Fix or decision: add/check a delayed fork setup penalty for soft fork defenses; prefer the defense that prevents the two-step fork even if another move looks locally active.
- Regression probe: from the move-12 root, hard AI should choose `(11,9)#182` instead of the losing local alternative `(9,10)#199`.

## 2026-04-24 - Deadline fallback must use detected fork defenses

- Game: `local-ai-3bf3e524-1e9f-410a-b1fd-85d0bbc4ff83`.
- Symptom: move 18 chose `(12,8)#164` with `deadlineBeforeFullSearch`; a longer budget eventually chose `(4,10)#194`, which prevented the later fork line.
- Root cause: the right soft fork defense was already present in `openThreeForkPointDefenses`, but expensive shortcut phases consumed the budget and fallback chose a generic move instead of ranking those detected defenses.
- Fix or decision: when inside the deadline reserve, choose a quick-ranked soft fork defense rather than falling through to generic fallback.
- Regression probe: from the move-18 compact board, hard AI at the normal 4s config should choose `(4,10)#194` and preserve practical response time.

## 2026-04-24 - Compound defense must not preempt hard open-three/open-four blocks

- Game: `local-ai-500e817e-6c25-4ea3-b544-eadd1f761440`.
- Symptom: move 26 chose `(4,11)#213` as `compoundThreatDefense`, missing the active human open-three/open-four creation block at `(4,10)#194`.
- Root cause: `compoundThreatDefense` ran before the hard open-four/open-three defense return and counted a move as handling the compound threat even though it left the active open-four creation move available.
- Fix or decision: a compound defense may not handle an active open-four creation threat unless it directly reduces that threat, except for an immediate counter-win.
- Regression probe: from the move-26 compact board, hard AI should choose `(4,10)#194`; non-blocking compound moves such as `(4,11)#213`, `(7,10)#197`, and `(10,13)#257` leave human `(4,10)#194` into double immediate wins.

## 2026-04-24 - Safe four shortcut must defer to opponent open-four creation defenses

- Game: `local-ai-10e0b66b-7280-474a-b8f9-bdb7951977a7`.
- Symptom: the final move looked like a missed block at `(6,13)#253`, but the move-42 root was already lost: human had immediate wins at `(6,13)#253` and `(6,8)#158`, and blocking `(6,13)` still allowed capture/line win `(5,14)#271`.
- Root cause: move 38 selected `(14,7)#147` as `safeFourBuilding` before calculating and resolving existing human open-four creation defenses. The engine probe showed move-38 defenses existed at `(10,11)#219` and `(6,7)#139`; after the selected attacking move, human had open-four creation replies `(10,11)#219`, `(6,7)#139`, and `(6,11)#215`, leading to a no-defense vertical fork.
- Fix or decision: `safeFourBuilding` should not preempt opponent open-four creation defense work unless the chosen move also resolves the active defensive burden or wins immediately.
- Regression probe: from the move-38 compact board, hard AI must not choose `(14,7)#147` while `openFourCreationDefenseMoves(for: computer)` is non-empty; the move-42 compact board should be treated as already unwinnable, not as a one-move missed block.
