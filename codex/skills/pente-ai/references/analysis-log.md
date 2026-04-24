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

## 2026-04-24 - Counter-fork must beat passive soft fork defense

- Game: `local-ai-e655bd1e-d17b-4c98-b7a3-529c109a907a`, move 16.
- Symptom: computer chose passive `(8,15)#293` with `deadlineBeforeShortcutSearch`, letting human take `(8,14)#274`; the stronger move was the computer's own open-three fork at `(7,11)#216`.
- Root cause: `safeOpenThreeForkMoves` used the stricter `openThreeForkLineCount` detector, so it missed a live fork already found by `PenteEngine.forkSetupMoves`; it also ran after expensive compound placement, leaving the AI near deadline.
- Fix or decision: classify safe open-three forks with robust `openThreeCount`, check them before compound placement, and accept verified forks that create multiple open-four follow-ups without the generic reply-risk probe.
- Regression probe: from compact board `...........................................................................................................................1..................0..................0.............0...10..............1.1.0...............1..1..............0.10..................0.........................................................................................................`, hard AI should choose `(7,11)#216` as `safeOpenThreeFork` within the normal 4s budget; `(8,15)#293` and `(8,14)#274` are weaker fallback defenses.

## 2026-04-24 - Shortcut attacks must avoid unblockable capture setups

- Game: `local-ai-0f95a56b-5efc-4995-becd-d01eebf359d4`, moves 8-10.
- Symptom: computer move 8 chose `(9,7)#142`, allowing human `(10,6)#124`; after that, the pair `(9,7)-(8,8)` could be captured at `(7,9)#178`, and the apparent block at `(7,9)` created a different pair vulnerable to `(6,9)#177`.
- Root cause: shortcut attack buckets filtered immediate capture exposure but did not reuse the delayed/unblockable capture-setup detector, so a deadline fallback could pick a threat-plan move whose only future defense handed over another capture.
- Fix or decision: apply `moveAllowsOpponentUnavoidableCaptureSetup` to threat plans and safe shortcut growth/open-three/block/capture buckets before they can become deadline fallback candidates.
- Regression probe: from compact board `................................................................................................................................................................10.................10..................0..................1..................0...........................................................................................................................`, hard AI must not choose `(9,7)#142` or `(8,10)#198`; those allow unblockable capture setups, while `(8,7)#141`, `(8,11)#217`, and `(10,10)#200` leave only defendable capture setups.

## 2026-04-24 - Active open-three creation must not wait behind partial threat plans

- Game: `local-ai-a1cf0e3f-84a8-42bf-aaf9-7258313da60c`, move 8.
- Symptom: computer chose passive `(7,7)#140` with `deadlineBeforeShortcutSearch`; it blocked a non-immediate human extension but created no own line, letting human keep initiative with capture setup replies such as `(8,7)#141` / `(11,10)#201`.
- Root cause: `rankedThreatPlanMoves` ran before the already-detected `safeOpenThreeCreationMoves`; under the normal 4s budget it returned a partial defensive result and starved active open-three choices `(8,7)#141` and `(12,11)#221`.
- Fix or decision: defer the expensive threat-plan bucket until after forcing/capture/open-three creation shortcuts have had their reply check. Threat plans are still used when no active open-three creation is available.
- Regression probe: from compact board `................................................................................................................................................................01..................01..................0...................1...................0........................................................................................................................`, hard AI should choose `(8,7)#141` via `openThreeCreation` instead of passive `(7,7)#140`.

## 2026-04-24 - Restorable open-four completion beats soft fork defense

- Game: `local-ai-5f032581-46eb-49d8-97e3-b296c5a03efd`, move 28 after human `(13,7)#146`.
- Symptom: computer chose soft fork defense `(9,8)#161`, letting the human block the growth, instead of completing the open four at `(11,6)#125`.
- Root cause: ordinary safe-four building rejected `(11,6)#125` because the placed stone could be captured immediately at `(11,5)#106`, but that capture was non-winning and left `(11,6)#125` legally restorable as a safe open-four completion on the next computer move.
- Fix or decision: add a narrow `restorableOpenFourBuilding` shortcut before soft fork defenses. It only accepts exposed open-four completions when every immediate capture of the new stone is non-winning, leaves no immediate opponent win, and allows the same move to restore a safe open four.
- Regression probe: from compact board `.........................................................................................................1...................................011110............0..00.1.................0..............1...10...................0...................1.....................................................................................................................`, hard AI should choose `(11,6)#125` with reason `restorableOpenFourBuilding`; prior probes for active open-three creation, counter-forks, and unblockable capture setup must still pass.

## 2026-04-24 - Counter-win must not reuse opponent open-four point

- Game: `local-ai-d2b948b4-e426-47a7-a503-b11fc8d3da09`, move 44 after human `(6,7)#139`.
- Symptom: computer chose `(5,6)#119` as `compoundThreatDefense`; human answered at `(8,9)#179`, blocking the computer's new immediate win while continuing the human attack, and the game later became unwinnable.
- Root cause: compound defense allowed an active human open-four creation to be ignored when the computer created an immediate counter-win. In this position the counter-win point was the same square as the human open-four point `(8,9)`, so the human could occupy the shared point and satisfy both needs.
- Fix or decision: reject compound defenses that create an immediate counter-win on any current opponent open-four creation point. Prefer the real open-four defense `(8,9)#179`, which also creates computer immediate win `(5,6)#119`.
- Regression probe: from compact board `.................................................................................................1........1..........0.....1.............0.0.0.0.............0.01..1...........0.0.....1.........1.01110.0.10........1.........1...................0.....................................................................................................................`, hard AI should choose `(8,9)#179`; `(5,6)#119` is only a shared-point counter-threat and must not preempt the open-four defense.
