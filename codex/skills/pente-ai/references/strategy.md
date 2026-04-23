# Pente AI Strategy Reference

## Sources

- Pente.org strategy forum on initiative, pairs, double threats, extending, shapes, and keystones: https://www.pente.org/gameServer/forums/thread.jspa?forumID=27&threadID=4553&tstart=33
- Board Game Arena Pente tips on pro opening rules, capture-aware blocking, and keystone/capture examples: https://en.doc.boardgamearena.com/Tips_pente
- Pente overview and tactics for stretch twos, open trias, stretch trias, open tesseras, advanced shapes, wedge, and extension: https://en.wikipedia.org/wiki/Pente
- Justapedia Pente strategy overview, useful as a compact mirror of the same concepts: https://justapedia.org/wiki/Pente

## Terms To Model

- **Open tria / open three**: three stones in a row with both ends open. It creates initiative because the opponent must prevent an open four/tessera.
- **Open tessera / open four**: four stones with both ends open. Unless capture can dismantle it, it is effectively winning because either end completes five.
- **Stretch two**: two stones separated by a gap. It avoids forming a capturable adjacent pair while preserving growth potential.
- **Stretch tria / stretch three**: a pair plus a separated stone with a gap. It threatens to become a tessera but can be countered by placing into the gap to threaten capture.
- **Stretch tessera / stretched four**: four-stone threat with a gap. It may force a block that creates a capturable pair.
- **Extension**: extending a line into a stretch tessera/tria to force a block that can be captured, often stealing initiative.
- **Keystone**: a blocking stone or pair whose removal reopens a five threat. A double keystone capture can create an unblockable double threat.
- **Double threat / fork**: one move creates two urgent threats, such as two open threes, an open three plus open four, or line threat plus fifth-pair capture.
- **Capture race**: a player near five captured pairs can force wins through pair captures even when line threats look stronger.

## Practical Priorities

1. Immediate win: make five or capture the fifth pair.
2. Immediate loss defense: stop opponent five/fifth-pair threats unless the computer has a stronger immediate win.
3. Open four/tessera creation and defense: treat open four creation as near-terminal, but check capture refutations.
4. Forks and double open threes: prevent live human forks and build live computer forks using the same detector.
5. Capture-threat resolution: prefer defenses that also create capture or line pressure.
6. Initiative-preserving moves: a block that builds a computer open three, capture threat, or future fork is better than a passive block.
7. Shape building: stretch twos, L/h/X/H-style growth, 4x3/5x3/hat-like triangles matter only when they create forcing trias, fork pressure, or capture tactics.

## Pitfalls

- Do not blindly extend an open three into a four. It is good only when it reaches another stone, forces a capture, creates a stronger continuation, or preserves initiative.
- Do not overvalue adjacent pairs. Pairs are capture liabilities unless they create immediate tactical value.
- Do not block an open three on the passive end if blocking the capture-side end neutralizes more threats.
- Do not treat Gomoku line strength as sufficient. Pente captures can dismantle lines and reopen blocked fours.
- Do not ignore opponent counter-threats. A move that creates an open three can be losing if it permits immediate capture-win, open four, or a stronger fork.
- Do not add a new defense by globally demoting attack. The best fixes usually add a new player-relative tactical concept and let both sides use it.

## How This Maps To Code

- Pattern recognition belongs in `PenteEngine` as player-relative functions.
- Static symmetry belongs in `PenteEvaluator` by adding the score for `maximizingPlayer` and subtracting the same score for the opponent.
- Search/shortcut behavior belongs in `PenteAI.Searcher`, with DEBUG group logging for new tactical buckets.
- UI/game-session evidence comes from `AIGameStore` JSONL logs.
