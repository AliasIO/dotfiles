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

## 2026-04-24 - Soft fork defense must not leave active capture threat unresolved

- Game: `local-ai-b46f96e1-ea29-4ce6-b6b4-d19a9f129d24`, move 6 after human `(8,10)#198`.
- Symptom: computer chose soft fork setup defense `(6,12)#234`, leaving the existing pair `(8,8)#160` / `(8,9)#179` capturable by human `(8,7)#141`.
- Root cause: when capture threats and soft forced defenses were mixed for shortcut reply checks, stable soft defenses only filtered exposure of the newly played stone. Under the deadline fallback, an unassessed soft fork defense could outrank the real capture response even though it did not improve the active capture-threat summary.
- Fix or decision: only mix soft forced defenses into the capture-threat defense shortcut when they improve the current capture-threat summary. In this position `(8,7)#141` remains as the capture-compatible defense, while `(6,12)#234` is excluded from capture-defense candidates.
- Regression probe: from compact board `................................................................................................................................................................1................0.10.................0..................................................................................................................................................................`, hard AI should choose `(8,7)#141`; `(6,12)#234` leaves immediate human capture `(8,7)#141` against indices `160,179`.

## 2026-04-24 - Capture responses must stay ahead of unassessed soft defenses

- Game: `local-ai-f4dcf8ae-c92b-4411-87e8-a96191e1a83e`, move 18 after human `(9,8)#161`.
- Symptom: computer chose `(12,11)#221` as `captureThreatDefense`, but human immediately played `(12,8)#164`, capturing `(11,8)#163` and `(10,8)#162`, opening the vertical line and forcing repeated emergency defenses until the human won.
- Root cause: the old capture-defense shortcut mixed true capture responses with soft fork defenses. The only direct capture response was `(12,8)#164`, while `(12,11)#221` was only a soft fork defense. Deadline fallback could promote unassessed soft defenses ahead of assessed capture responses.
- Fix or decision: mirror the capture-compatible soft-defense filter in the nonfatal shortcut path and keep assessed non-fatal reply-checked moves ahead of unassessed moves under deadline pressure. Do not patch the later `instantLossDefense` sequence; it is downstream from move 18.
- Regression probe: from compact board `..........................................................................................................................0....................................0.011...............1..0..................0..............1..10..................0..................1......................................................................................................`, hard AI should choose `(12,8)#164`; `(12,11)#221` leaves human capture `(12,8)#164` against indices `163,162`.

## 2026-04-24 - Risky open-four creation defense must beat soft fork deadline fallback

- Game: `local-ai-e3e823aa-25bd-4333-bd29-dee6f27471ff`, move 16 after human `(12,7)#145`.
- Symptom: computer chose `(13,6)#127` as `deadlineBeforeShortcutSearch` even though `(11,7)#144` was already detected as `openFourCreationDefenses`; human then played `(11,7)`, restored the threat after a capture, and won at `(8,7)#141`.
- Root cause: `(11,7)#144` was marked `riskySingleOpenThreeDefenses`, so `stableOpenFourCreationDefenses` / `hardOpenFourResolutionDefenses` were empty. The nonfatal shortcut path then let soft fork defenses run first; when the risky open-four defense reply check exhausted the budget, fallback dropped into soft fork ranking and selected `(13,6)`.
- Fix or decision: pass active open-four creation defenses into `nonFatalShortcutMoves` and check risky open-four defenses before soft fork defenses. If their reply check consumes the deadline, keep the active block as the deadline fallback instead of falling through to soft fork ranking.
- Regression probe: from compact board `...........................................................................................................................1..................00.0.............01110................0.10..................10...................1.........................................................................................................................................`, hard AI should choose `(11,7)#144`; after that move, human has no immediate win and no open-four creation.

## 2026-04-24 - Shift from one-off shortcut fixes to tactical search plus bench

- Game: architectural follow-up after repeated advanced losses, not a single game.
- Symptom: recurring losses came from many related tactical angles that are easy to see but brittle to encode as direct shortcut rules: open-four creation, fork setup, capture threats, and deadline fallback interactions.
- Root cause: normal negamax leaves stopped at static evaluation in tactically noisy positions, while the persistent regression set lived only in prose and temporary probes.
- Fix or decision: add a bounded quiescence extension at search leaves. It searches one extra ply over at most four forcing moves and only while more than 500ms remains, using existing player-relative tactical helpers. Add `Scripts/PenteAIRegressionBench/main.swift` so compact boards from this log are executable.
- Regression probe: from `/Users/elbert/Sites/pente`, run `swiftc Pente/PenteAI.swift Pente/PenteEngine.swift Pente/PenteEvaluator.swift Scripts/PenteAIRegressionBench/main.swift -o /tmp/pente_ai_regression_bench && /tmp/pente_ai_regression_bench`; all recorded fixtures should pass before handing back Pente AI changes.

## 2026-04-24 - Fork capture must not leave extra fork pressure

- Game: `local-ai-43454efa-396c-4d74-b6f0-72391190a378`.
- Symptom: human won at move 29 after restoring an open four. The final `partialInstantLossDefense` was already lost: both endpoints could not be blocked.
- Root cause: the first practical error was computer move 22. The AI chose capture `(6,6)#120` as `forkCaptureDefense`, but that left two human fork setup replies, including the played `(8,11)#217`; direct fork defense `(9,11)#218` reduced the pressure to one line. The capture bonus in `forkResolutionOrderingScore` overpowered residual fork pressure.
- Fix or decision: penalize residual fork pressure for fork-resolving capture defenses so a capture does not beat a cleaner direct fork defense when it leaves multiple fork setups.
- Regression probe: add the move-22 compact board to `Scripts/PenteAIRegressionBench/main.swift`; hard AI should choose `(9,11)#218`, with no immediate human win or open-four creation after the move.

## 2026-04-24 - Keep 4s timeout but reserve time to return tactical shortcuts

- Game: timeout-policy follow-up after repeated `exceededDeadline` phases.
- Symptom: several advanced moves ran beyond the nominal 4s budget. In the active-open-three regression, the AI had `(8,7)#141` first in `shortcutRootMoves` at about 3.9s, then started `shortcutSearch` anyway and finished around 6.9s with a different move.
- Root cause: deadline checks used only `shouldStop()`, so expensive shortcut search, full search, and reply probes could start with too little time left to return cleanly.
- Fix or decision: keep the default Advanced timeout at 4s, add deadline-reserve helpers, return pre-ranked shortcut/root moves inside the reserve, trust active risky open-four defenses inside the reserve, and cap late reply/tactical detector starts.
- Regression probe: compact-board bench must still pass all recorded fixtures; the active-open-three board should choose `(8,7)#141` instead of starting late shortcut search.

## 2026-04-24 - Move from human-only losses to headless pressure testing

- Game: workflow/tooling follow-up, not a single loss.
- Symptom: relying only on human wins was too slow and produced one-off fixes; the compact bench also exposed that deadline-sensitive fixtures could regress when expensive phases preempted already-known tactical moves.
- Root cause: regression fixtures could only assert exact moves, simulator logs still required manual fixture transcription, and there was no headless self-play/generated-position harness to find objective tactical misses outside the UI.
- Fix or decision: add shared Swift support for AI scripts, extend `PenteAIRegressionBench` with property assertions/acceptable/rejected moves and deterministic `topMoveRandomization: 1`, add `Scripts/pente_ai_fixture_from_log.py`, and add `PenteAIPressureBench` for headless generated-position and self-play checks. While validating, also keep safe counter-forks ahead of soft deadline fallback, prefer unrefuted capture-compatible defenses, and prevent soft-fork/compound-placement fallback from preempting active open-four creation defenses.
- Regression probe: compact-board bench must pass all fixtures; pressure bench default should complete outside the simulator with zero fatal findings, with warning findings treated as inspection candidates.

## 2026-04-24 - Make captured games and pressure findings promotable

- Game: workflow/tooling follow-up, not a single loss.
- Symptom: simulator games were captured, but exporting a complete single-player game and replaying generated pressure positions still required manual log spelunking; seeded generated positions could also drift because the sampled candidate pool inherited nondeterministic ordering.
- Root cause: DEBUG logs lacked build/launch metadata and terminal session markers, there was no one-command game export bundle, and pressure-bench replay filtered findings without first making generated position construction deterministic.
- Fix or decision: add DEBUG build metadata and `sessionEnded` events to game/decision logs, add `Scripts/pente_ai_export_game.py`, add pressure-bench `--replay`, `--emit-fixtures`, categorized findings, per-move duration reporting, shared run deadline, and sort generated candidate pools before seeded sampling. Treat low-budget timeout warnings as noise unless they reproduce near the Advanced 4s budget.
- Regression probe: run the compact bench, the pressure smoke, and an export smoke against the booted simulator. A modest longer pressure batch should have zero fatal findings; warning-only output is triage material, not an automatic AI patch.

## 2026-04-24 - Counter-win should beat temporary open-four capture reset

- Game: `local-ai-e734ebb4-eb0b-4604-90c6-d56afedaad64`, move 16 after human `(7,10)#197`.
- Symptom: computer chose capture `(9,12)#237` as `openFourCaptureDefense`; human immediately replayed `(7,10)#197`, restoring the same two open-four creation points and pushing the computer into a losing defensive loop.
- Root cause: with no stable direct open-four defense, the AI valued the temporary capture reset over a safe four-building counter-threat. Candidate `(11,5)#106` created an immediate computer win at `(12,4)#88`; after the human's forced block, the original open-four pressure remained defendable instead of being handed back with initiative.
- Fix or decision: add `activeOpenFourCounterWinMoves` before open-four capture defenses. It only runs when multiple open-four creation defenses exist, no stable open-four defense exists, the counter-win point does not overlap the opponent's open-four points, and every forced response leaves no immediate loss and a defendable residual position.
- Regression probe: compact-board fixture `counter-win beats temporary open-four capture reset` should choose `(11,5)#106` and create a computer immediate win; prior risky single open-four defense fixture must still choose the direct block `(11,7)#144`.

## 2026-04-24 - Pressure bench must not blame already-lost roots

- Game: headless pressure batch, not a simulator game.
- Symptom: the larger batch reported four fatal findings, but fixture probes showed the printed boards already had opponent immediate wins with `instantLossDefenseMoves` empty. Example: the `captureThreat` board had opponent line wins `(7,8)#159` / `(12,8)#164` plus capture win `(11,11)#220`; choosing `(11,11)` only removed the capture threat and still lost to the line wins.
- Root cause: the pressure bench judged the selected move from the after-state only. It flagged capture or instant-loss failures even when the root position had no full legal defense, which made already-lost positions look like current-move tactical misses.
- Fix or decision: update `Scripts/PenteAIPressureBench/main.swift` to compute opponent immediate wins before the move and skip current-move fatal blame when the root is already lost. Future analysis should move one or more plies earlier in that case.
- Regression probe: pressure smoke passed; larger run `--games 4 --positions 32 --max-moves 70 --time-limit-ms 1200 --depth 4 --max-candidate-moves 16 --max-seconds 600` finished with `fatal=0 warnings=139` in 611s.

## 2026-04-24 - WPente opening book fast path

- Game: architecture follow-up after comparing Mark Mammel's WPente.
- Symptom: WPente plays early moves virtually instantly, while the app still spent search time in familiar opening shapes and sometimes reached bad early structures before tactics were visible.
- Root cause: the app had no opening book; every early move went through the same tactical search and shortcut cascade. The WPente package included `OPNGBK.PEN`, which decodes as 397 16-bit Pente opening lines.
- Fix or decision: add `PenteOpeningBookData.swift` from the local WPente Pente book and a fast no-capture, first-10-ply symmetric matcher in `PenteOpeningBook.swift`. `PenteAI` now checks safe book moves after immediate wins and before search, rejecting book moves that leave immediate line or winning-capture replies. Keep captured/replayed book-line support as a future enhancement, and verify redistribution rights before shipping the imported data publicly.
- Regression probe: opening probe selected book moves in 5-30ms; compact regression bench still passed all 9 fixtures; pressure smoke passed with `fatal=0 warnings=0`; a modest run `--games 2 --positions 8 --max-moves 40 --time-limit-ms 700 --depth 4 --max-candidate-moves 16 --max-seconds 180` finished with `fatal=0 warnings=81`.

## 2026-04-24 - Add conservative forced-threat solver after concrete shortcuts

- Game: architecture follow-up, not a single captured loss.
- Symptom: hand-written tactical rules were still brittle for longer initiative sequences where the computer needs to see that every forced reply permits another forcing move.
- Root cause: the existing shortcut stack could spot immediate wins, captures, open-four creation, fork defense, and one-ply threat plans, but it did not have a bounded all-replies proof for VCT/VCF-style continuations.
- Fix or decision: add a conservative forced-threat solver in `PenteAI` after concrete non-fatal shortcuts such as active open-three creation and before the older fuzzy threat-plan heuristic. It searches only forcing attacks, requires every detected defense to preserve a win, rejects broad defense sets, treats immediate captures as possible defenses so capture-vulnerable lines must prove they can continue, and skips pure capture-setup attacks because they are too soft for a proof shortcut.
- Regression probe: compile both headless benches; run compact regression serially because parallel pressure runs can starve the 4s deadline-sensitive fixture and produce false fallback failures. Serial compact bench passed 9/9 in 36.63s; pressure smoke passed with `fatal=0 warnings=0`; modest pressure batch `--games 2 --positions 8 --max-moves 40 --time-limit-ms 700 --depth 4 --max-candidate-moves 16 --max-seconds 180 --finding-limit 20` passed with `fatal=0 warnings=62`.

## 2026-04-24 - Soft capture cleanup must not allow quiet open-four setup

- Game: `local-ai-09406e21-31ca-463c-b3a8-519ca4643a76`, first practical error at computer move 42.
- Symptom: computer chose `(9,6)#123` as `captureThreatDefense`, clearing a non-winning capture threat from three to four human captures. Human then played quiet setup `(6,13)#253`, forcing an open-four chain and eventually winning by capture at `(10,9)#181`.
- Root cause: the capture-defense shortcut trusted a soft capture-compatible forced defense when it reduced capture pressure, but its reply probe did not treat quiet opponent moves that create new open-four creation pressure as fatal enough. The AI missed active blockers such as `(11,5)#106` or `(11,8)#163`, which leave the capture available but keep the position defendable and preserve computer initiative.
- Fix or decision: include opponent open-four setup replies in shortcut reply probes, make new open-four creation replies fatal when the mover has no direct win, and deflect soft capture-compatible defenses to active capture responses when the soft defense allows this quiet setup class. Also preserve a single urgent tactical response if reply checking overruns the deadline; otherwise deadline overrun can discard a valid capture response and fall through to a soft fork fallback.
- Regression probe: add compact-board fixture `active blocker beats soft capture cleanup`: board `....................................................................................................1...................0....01.............01..0..............10.0.............101001...............10.1...............1001...............0110...................0...................1..................................................................................`, captures `[3,3]`, last move `(6,9)#177`; reject `(9,6)#123`, accept `(11,5)#106` or `(11,8)#163`. Serial compact bench passed 10/10 in 47.85s; pressure smoke passed with `fatal=0 warnings=1`.

## 2026-04-25 - Pressure bench needs stricter discovery mode

- Game: workflow/tooling follow-up after an 8-hour generated-position run.
- Symptom: the long run produced `fatal=0` but `warnings=1187`, which meant the old fatal oracle was too narrow to find the initiative and pressure mistakes seen in human games.
- Root cause: fatal findings only covered immediate win/loss and winning capture misses. Open-four pressure, fork pressure, non-winning capture pressure, teacher disagreements, and ignored forcing attacks were warning-only or invisible.
- Fix or decision: extend `Scripts/PenteAIPressureBench/main.swift` with `--strict-pressure`, `--teacher`, `--strict-teacher`, and `--jsonl`; add `Scripts/pente_ai_findings_summary.py` to cluster JSONL findings into replay commands. Keep default pressure smoke backward-compatible, but use strict/teacher JSONL mode for discovery batches.
- Regression probe: compile the pressure bench, run a default smoke, run a JSONL smoke, then run strict discovery such as `--strict-pressure --teacher --teacher-depth 3 --teacher-time-limit-ms 700 --strict-teacher --jsonl /tmp/pente_pressure_findings_strict.jsonl`; summarize with `python3 Scripts/pente_ai_findings_summary.py /tmp/pente_pressure_findings_strict.jsonl`.

## 2026-04-25 - Mmai teacher catches quiet book move

- Game: Mmai teacher exact-history replay, history `180,160,184,198,182`.
- Symptom: the computer chose quiet opening-book move `(10,9)#181`; Mark Mammel's level-12 AI preferred `(8,9)#179`, which immediately created two computer open-four creation follow-ups without an immediate human win or winning capture reply.
- Root cause: the opening book returned before active tactical open-three/open-four setup checks, and an expensive reply probe could spend the whole 4s budget before the stronger tactical move survived selection.
- Fix or decision: add a local Mmai WASM teacher bench that treats Mmai as an external move oracle, add exact-history replay, and allow quiet opening-book positions to be overridden by safety-filtered moves that create multiple open-four follow-ups. Keep the override disabled when there is active human capture or open-four pressure.
- Regression probe: compact-board fixture `Mmai open-four creation beats quiet opening book move` should choose `(8,9)#179`; `pente-mmai-teacher-bench --history 180,160,184,198,182` should report local and Mmai agreement with zero findings.

## 2026-04-25 - Human-style exploit bench

- Game: workflow/tooling follow-up after observing that the user's manual play found stronger weaknesses than neutral headless discovery.
- Symptom: manual wins still produced better tactical failures, but a full reverse analysis could take around 40 minutes.
- Root cause: generated positions were tactical but not adversarial enough; they did not intentionally steer into the user's recurring motifs or continue from proven weak real-game boards.
- Fix or decision: add `Scripts/PenteAIExploitBench/main.swift`. It runs the real computer config against a hostile human-side policy, supports `--seed-game-log` from exported simulator games, writes JSONL findings, and reuses `Scripts/pente_ai_findings_summary.py` for clustering.
- Regression probe: compile the exploit bench, run a fresh-game smoke with reduced computer settings, export a simulator game with `Scripts/pente_ai_export_game.py`, run a seed-log smoke, and summarize the JSONL output.

## 2026-04-25 - Capture race must not bypass active open-four defense

- Game: `local-ai-23dad006-3118-427c-bafe-0954c880f367`, first practical error at computer move 42 after human `(11,9)#182`.
- Symptom: computer chose capture `(11,6)#125` as `captureRace`, reaching four captures but leaving human `(11,11)#220`; after that, human had two immediate line wins and move 44 was already lost.
- Root cause: `captureRace` returned before `openFourCreationDefenses` ran. The existing engine already detected human open-four creation points `(11,7)#144` and `(11,11)#220`, but the capture-race shortcut only checked immediate wins/capture wins and accepted a capture that resolved one endpoint while leaving the other.
- Fix or decision: compute active open-four creation defenses before capture race and reject non-winning capture-race moves unless they reduce the open-four burden at least as well as the best available defense. The move-42 board now chooses `(11,11)#220` or `(11,7)#144` instead of `(11,6)#125`.
- Regression probe: compact-board fixture `capture race must resolve active open-four creation` rejects `(11,6)#125`, accepts `(11,7)#144` or `(11,11)#220`, and asserts no human immediate win/open-four creation after the selected move. Serial compact bench passed 12/12 in 74.90s; short pressure smoke passed with `fatal=0 warnings=24`.

## 2026-04-25 - Opening override may resolve active open-four pressure

- Game: `local-ai-04be2b8b-a210-4b99-99f3-52be045b6d24`, first practical error at computer move 6 after history `180,160,237,162,199`.
- Symptom: computer chose opening-book block `(9,11)#218`; Mmai preferred `(9,8)#161`, which both removed the human open-four creation point and created two computer open-four creation points.
- Root cause: `rankedOpeningTacticalOverrideMoves` was disabled whenever the human already had an open-four creation move, so the AI blindly took the first safe book block. The triage tool also initially missed this because it ignored `sessionRestarted` and dropped the center stone from exact histories.
- Fix or decision: allow opening tactical overrides under active open-four pressure only when the candidate fully resolves the human open-four creation moves, still creates at least two computer open-four creation moves, and passes the existing immediate-win/capture safety checks. Also treat `sessionRestarted` like `sessionStarted` when deriving teacher histories.
- Regression probe: compact-board fixture `opening override may resolve human open-four pressure` should choose `(9,8)#161` and reject `(9,11)#218`; focused Mmai history `180,160,237,162,199` should report zero findings. Serial compact bench passed 13/13 in 69.14s; short pressure smoke passed with `fatal=0 warnings=3`.

## 2026-04-25 - Capture pressure must not preempt forcing counter-threats

- Game: first `pente_ai_long_run.py --hours 23` batch seeded from `/tmp/pente-ai-triage-current/export/ai-game-log.jsonl`.
- Symptom: exploit batch stopped on five fatal findings. Two were oracle false positives after the computer had already won; the real seed-3 branch showed the computer choosing passive capture/open-four responses such as `(12,11)#221` and `(11,11)#220` while stronger moves created forcing counter-threats.
- Root cause: open-four defense mixed temporary capture resets with stable direct defenses, four-building shortcuts ignored active capture pressure, and capture-compatible defenses were ordered below soft deflections even when they created multiple own open-four or immediate-win follow-ups.
- Fix or decision: ignore exploit findings after a computer-winning move; prefer stable open-four defenses over temporary capture resets; require four-building shortcuts to resolve active capture pressure; prefer forcing capture-compatible defenses; and add a narrow active-open-four/capture/fork counter-win shortcut for moves such as `(9,8)#161` that create multiple immediate computer wins while reducing fork pressure.
- Regression probe: compact-board fixtures `four building must resolve active capture pressure` should choose `(7,8)#159` and reject `(12,11)#221`; `late capture defense must reduce fork pressure` should choose `(9,8)#161` and reject `(11,11)#220`. Serial compact bench passed 15/15 in 58.73s after the patch.

## 2026-04-25 - Remaining exploit branch starts before the double-loss position

- Game: same seeded exploit batch as above, seed-1/seed-2 replay branch.
- Symptom: after the first patch, seed 3 was clean but seed 1/2 still reports repeated `forkPressure`, `captureThreat`, and final `humanWin` findings. By ply 20 the human has immediate wins at both `(12,7)#145` and `(7,7)#140`, with `instantLossDefenseMoves` empty, so that position is already lost.
- Root cause: the current first suspect is earlier, around ply 16/18. The computer chooses `(12,9)#183` to remove open-four pressure while leaving the same fork pressure; alternative `(8,9)#179` resolves a different burden but creates a non-winning capture race. This branch needs replayed line analysis before turning it into a rule.
- Fix or decision: do not patch this branch yet. Restart long-run discovery with `--no-stop-on-fatal` so known seed-1/seed-2 failures are accumulated into clusters instead of stopping the 23-hour loop immediately.
- Regression probe: summarize `/tmp/pente-ai-long-run-23h-rerun/findings-all.jsonl` with `python3 Scripts/pente_ai_findings_summary.py` and replay the largest seed-1/seed-2 clusters before adding another compact fixture.

## 2026-04-26 - Full 23-hour mixed long-run converges on early fork-pressure miss

- Game: `pente_ai_long_run.py --seed-game-log /tmp/pente-ai-triage-current/export/ai-game-log.jsonl --hours 23 --no-stop-on-fatal`, output `/tmp/pente-ai-long-run-23h-rerun`.
- Symptom: the completed run found `8185` findings across `161` batches: `5016` fatal, `3169` warnings, and `722` summary clusters. A few exploit slices had zero fatal findings, but later exploit slices again produced fatal seeded-game findings, so single clean exploit slices are variance rather than proof of resolution.
- Root cause: the dominant stable discovery is the same self-play cascade. The earliest repeated miss is `self-play-1:6`, player `1`, selected `(8,10)#198`, with `(12,9)#183` listed as the fork-pressure defense. Combined summary counts ranked this at `424` hits, ahead of later cascade moves `(6,11)#215`, `(11,10)#201`, and `(9,11)#218`.
- Fix or decision: do not patch from aggregate counts alone. Replay `self-play-1:6` first and verify whether `(12,9)#183` is a real tactical improvement or a pressure-oracle artifact. Then inspect whether the later ply-15/21 clusters disappear when that early move changes, before adding broad fork-pressure ordering rules.
- Regression probe: `/tmp/pente_ai_pressure_bench --replay self-play-1:6 --emit-fixtures --verbose`; if confirmed, add a compact fixture for the earliest board and run the serial compact regression bench before another long discovery loop.

## 2026-04-26 - Opening book must not leave active fork pressure

- Game: replay `self-play-1:6` from `/tmp/pente-ai-long-run-23h-rerun`.
- Symptom: strict pressure replay reproduced the top cluster: the AI selected opening-book move `(8,10)#198` while the engine still listed `(12,9)#183` as the only active fork-pressure defense. If the opponent then played `(12,9)#183`, they gained open-four creation at `(10,9)#181` and left the computer with multiple fork defenses.
- Root cause: `openingBookMoveIsSafe()` checked immediate line wins and winning capture replies, but not active open-three fork pressure. Because opening book selection runs before the normal fork-defense shortcut stack, a quiet book move could bypass a known fork-pressure defense.
- Fix or decision: reject opening-book moves that do not reduce existing `openThreeForkPointDefenseMoves` pressure. The replay now produces zero findings; the AI may choose either `(8,9)#179` or `(12,9)#183`, as long as it rejects `(8,10)#198` and leaves no human open-three fork.
- Regression probe: compact-board fixture `opening book must resolve active fork pressure`; exact replay `--replay self-play-1:6 --depth 4 --time-limit-ms 700 --max-candidate-moves 16 --strict-pressure` writes zero findings. Serial compact bench passed 16/16 in 62.21s.

## 2026-04-26 - Counter-win beats soft capture deflection under fork pressure

- Game: `local-ai-4d146a27-eb3c-4c65-8f90-68879279e618`, first practical error at computer move 34 after human `(11,6)#125`.
- Symptom: computer chose soft capture deflection `(13,6)#127` as `captureThreatDefense`; Mmai preferred `(7,6)#121`, which created two immediate computer wins and two open-four creation points while clearing the human fork pressure.
- Root cause: the capture-defense path considered direct capture responses and soft forced defenses, but it did not generate counter-win moves outside those defensive buckets. The chosen soft deflection still left two human fork threats, so the later `partialInstantLossDefense` was downstream from an already bad initiative loss.
- Fix or decision: when a soft capture deflection is available under non-winning capture pressure plus heavy fork pressure, consider narrow active fork/capture counter-wins that create at least two immediate wins, create at least two own open-four creation points, clear the fork pressure, and do not worsen capture pressure. The move-34 board now chooses `(7,6)#121` with reason `activeForkCaptureCounterWin`.
- Regression probe: compact-board fixture `counter-win resolves fork and capture pressure` rejects `(13,6)#127` and expects `(7,6)#121`; focused Mmai history `180,160,123,199,142,104,159,141,122,161,179,139,179,178,141,160,196,103,142,178,181,105,182,183,102,106,107,162,126,145,88,85,125` reports zero findings. Serial compact bench passed 17/17 in 108.77s; short pressure smoke had `fatal=0 warnings=12` at a reduced 700ms budget.

## 2026-04-26 - Fork counter-win can beat a stable open-four block

- Game: `local-ai-6e3bf519-580c-4b17-9beb-bb011c517fb0`, first concrete teacher disagreement at computer move 28 after human `(11,9)#182`.
- Symptom: computer chose stable open-four block `(8,6)#122` as `openFourDefense`; Mmai preferred `(9,8)#161`, which created immediate computer winning pressure and multiple own open-four creation points while reducing a large human fork-pressure set. The block looked locally safe but left the initiative with the human.
- Root cause: the active open-four shortcut stack only considered direct blocks, active open-four counter-wins, and capture counter-wins. It rejected `(9,8)#161` because some forced human replies increased human open-four creation count, even though every reply let the computer restore the attack with `(7,11)#216` and create two immediate wins.
- Fix or decision: add a narrow `activeOpenFourForkCounterWin` shortcut before ordinary open-four defense. It considers a wider but bounded candidate slice only when there are multiple open-four blocks and heavy fork pressure, requires the candidate to create immediate computer wins plus multiple own open-four creation points, reduce fork pressure, avoid immediate/capture losses, and verify that every forced reply is either already quiet or allows a continuation that creates two immediate computer wins.
- Regression probe: compact-board fixture `counter-win beats open-four block that leaves fork pressure` expects `(9,8)#161` and rejects `(8,6)#122`; focused Mmai history `180,160,177,181,162,198,144,179,126,108,141,217,236,159,199,218,139,179,158,120,196,215,140,138,142,143,182` reports zero findings. Serial compact bench passed 18/18 in 76.36s; short pressure smoke had `fatal=0 warnings=31` at a reduced 700ms budget.

## 2026-04-26 - Soft fork defenses must stay capture-safe

- Game: `local-ai-bf9f7410-e423-48af-9af6-a2b593e5d47c`, first avoidable cause at computer move 14 after human `(6,13)#253`.
- Symptom: computer chose soft fork defense `(8,7)#141` under deadline fallback. That placed a second computer stone next to `(8,8)#160`, allowing the human capture `(8,6)#122` to take both stones. Move 16 then blocked open-four pressure but left the already-created capture.
- Root cause: `rankedSoftForkDefenseMoves` and its quick deadline fallback penalized capture exposure but did not filter it when capture-safe fork defenses existed. The move set already included safe alternatives `(10,7)#143`, `(7,8)#159`, `(12,9)#183`, and `(8,5)#103`.
- Fix or decision: before ranking soft fork defenses, prefer moves that do not expose the played stone and do not worsen the current capture-threat summary; only fall back to the original list when every candidate is capture-unsafe. The compact board now chooses `(10,7)#143` and rejects `(8,7)#141`.
- Regression probe: compact-board fixture `soft fork defense must not expose capture` rejects `(8,7)#141` and accepts capture-safe fork defenses. Serial compact bench passed 19/19 in 82.23s; short pressure smoke had `fatal=0 warnings=33` at a reduced 700ms budget. Per user request, the simulator was not rebuilt after this fix.

## 2026-04-26 - Risky open-four defense still beats capture cleanup

- Game: 12-hour closed-loop batch from `/tmp/pente-ai-closed-loop-12h`, then cleaned strict-pressure smoke `/tmp/pente-ai-closed-loop-12h-post-oracle-smoke-4.jsonl`.
- Symptom: after removing priority-blind pressure false positives, the first real fatal cluster was `self-play-1:27` / `self-play-2:27`. Player `0` selected capture cleanup `(9,14)#275` as `captureThreatDefense`, leaving opponent open-four creation `(6,12)#234`.
- Root cause: when the only open-four defense worsened non-winning capture exposure, `captureStableNonFatalDefenses` removed it from `hardOpenFourResolutionDefenses`. The later capture-defense path then preempted the risky but non-fatal open-four block, even though leaving an open-four creation point hands over a forcing line threat.
- Fix or decision: add a narrow `riskyOpenFourDefense` fallback before fork/capture cleanup. It uses open-four creation defenses that do not allow immediate wins or winning captures, even if they worsen non-winning capture pressure. Also update the pressure bench so fork/capture/open-four findings only count defenses that remain viable against higher-priority threats, preventing false rules from positions where no move can solve every pressure type.
- Regression probe: compact-board fixture `risky open-four defense beats capture cleanup` expects `(6,12)#234` and rejects `(9,14)#275`. `Scripts/PenteAITacticalProbe/main.swift` reproduces the original unswapped board and now selects `(6,12)#234`; serial compact bench passed 17/17 in 133.48s; post-fix strict-pressure smoke passed with `fatal=0 warnings=22`.

## 2026-04-26 - Capture responses are not fork defenses without fork pressure

- Game: 12-hour closed-loop cycle 2 teacher-pressure batch, `generated-8:10`, compact board `..................................................................................................................................................................1.................01..................0...........................1..................00..................10............................................................................................`.
- Symptom: player `1` selected distant capture `(3,15)#288` as `forcedForkDefense`, leaving a non-winning human capture threat intact. Direct response `(10,7)#143` was the only scanned move that cleared capture pressure from `threats=1, stones=2` to zero.
- Root cause: the root shortcut stack added every `immediateCaptureThreatResponse` to `hardForkResolutionDefenses`, even when there was no active fork pressure. That let an unrelated capture preempt the normal capture-threat defense bucket.
- Fix or decision: only pass immediate capture responses into the fork-resolution bucket when they actually reduce active fork pressure; otherwise keep them in `captureThreatResponses` so direct capture cleanup can win ordering.
- Regression probe: compact-board fixture `capture response must not masquerade as fork defense` expects `(10,7)#143` and rejects `(3,15)#288`. Tactical probe selects `(10,7)#143`; serial compact bench passed 18/18 in 132.19s; post-fix strict-pressure smoke passed with `fatal=0 warnings=20`.

## 2026-04-26 - Open-four capture defense should reduce fork pressure

- Game: 12-hour closed-loop cycle 3 exploit branch `seed-1-move-1-after:16`, compact board `..........................0............................................................................0..................1...1..............1..0...............1.0................10................100................1.0..............................................................................................................................................`.
- Symptom: player `1` chose stable open-four block `(9,12)#237`, clearing human open-four creation but leaving four human fork setup points. The existing tactical detector also found capture defense `(10,10)#200`, which cleared both open-four creation and fork pressure.
- Root cause: when `stableOpenFourCreationDefenses` was non-empty, `hardOpenFourResolutionDefenses` discarded `openFourResolvingCaptureDefenses`. That preserved prior anti-temporary-capture-reset behavior, but it also hid capture defenses that strictly improve a compound open-four plus fork-pressure position.
- Fix or decision: keep open-four-resolving capture defenses alongside stable open-four blocks only when the capture fully clears current open-four creation and reduces fork pressure below the best stable block.
- Regression probe: compact-board fixture `open-four capture defense should reduce fork pressure` expects `(10,10)#200` and rejects `(9,12)#237`. Exact exploit replay `--replay seed-1-move-1-after:16` passed with `fatal=0 warnings=0`; serial compact bench passed 19/19 in 137.87s; post-fix strict-pressure smoke passed with `fatal=0 warnings=17`.
