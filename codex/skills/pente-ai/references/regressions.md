# Pente AI Current Regression Checklist

Use this compact checklist before changing AI behavior. Read the chronological `analysis-log.md` only when a current failure matches one of its motifs and search it with `rg` rather than loading the whole file.

## Canonical Bench

Run deadline-sensitive benches serially from `/Users/elbert/Sites/pente`:

```bash
swiftc Scripts/PenteAISupport/Support.swift Pente/PenteOpeningBookData.swift Pente/PenteOpeningBook.swift Pente/PenteAI.swift Pente/PenteEngine.swift Pente/PenteEvaluator.swift Scripts/PenteAIRegressionBench/main.swift -o /tmp/pente_ai_regression_bench
/tmp/pente_ai_regression_bench
```

The current bench contains 25 fixtures. Treat the fixture source as authoritative for boards, expected moves, assertions, and any explicit median CPU-time guard.

## Durable Invariants

- Resolve immediate wins and unavoidable losses before softer attack or cleanup.
- Do not let capture races, routine captures, opening-book moves, compound placements, or soft fork defenses bypass active open-four or fork pressure.
- Prefer a forcing counter-win over passive defense only when every forced reply remains non-losing and the counter-threat is not neutralized at the opponent's existing threat point.
- Keep capture defenses capture-safe and compare their residual fork/open-four pressure with the best direct defense.
- Reject attack shortcuts that expose the played stone, create an unavoidable capture setup, or hand over a stronger open-four/fork reply.
- Preserve already-detected urgent responses when reply checking hits the deadline; do not fall through to a softer generic fallback.
- Keep opening-book moves behind immediate tactical safety and reject book moves that leave active fork pressure.
- Treat pressure-bench findings as hypotheses. Move earlier when the root is already lost and verify proposed defenses against higher-priority threats with the tactical probe.
- Keep the Advanced configuration at depth 6, 4,000ms, and 20 candidates. Preserve return-time reserve behavior rather than raising the timeout.

## Fixture Groups

### Open-four and initiative

- `active open-three creation before partial threat plans`
- `restorable open-four completion beats soft fork defense`
- `counter-win cannot reuse opponent open-four point`
- `risky open-four creation defense beats soft fork fallback`
- `risky open-four defense beats capture cleanup`
- `counter-win beats temporary open-four capture reset`
- `capture race must resolve active open-four creation`
- `opening override may resolve human open-four pressure`
- `open-four capture defense should reduce fork pressure`
- `forcing closed four can precede open-three defense`
- `counter-win may keep capture pressure flat when reducing fork pressure`
- `safe row four before deferred capture defense`

### Fork and capture pressure

- `counter-fork beats passive soft fork defense`
- `soft fork defense must resolve active capture threat`
- `capture response stays ahead of unassessed soft defense`
- `fork capture must not leave extra fork pressure`
- `active blocker beats soft capture cleanup`
- `late capture defense must reduce fork pressure`
- `capture response must not masquerade as fork defense`
- `empty fork capture candidates avoid duplicate work`

### Opening and growth

- `Mmai open-four creation beats quiet opening book move`
- `opening book must resolve active fork pressure`
- `four building must resolve active capture pressure`
- `counter threat must avoid delayed capture setup`
- `stretched four forces capture-vulnerable block`

## Focused History Search

Search only matching historical entries, for example:

```bash
rg -n -i 'deadline|fallback' /Users/elbert/Sites/dotfiles/codex/skills/pente-ai/references/analysis-log.md
rg -n -i 'open-four|fork|capture|opening book' /Users/elbert/Sites/dotfiles/codex/skills/pente-ai/references/analysis-log.md
```

When an authorized implementation adds a durable regression, add the executable fixture to `Scripts/PenteAIRegressionBench/main.swift` first, update this checklist, and keep chronological narrative in `analysis-log.md` brief.
