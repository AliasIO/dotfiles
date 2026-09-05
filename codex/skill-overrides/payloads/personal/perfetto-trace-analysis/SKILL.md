---
name: perfetto-trace-analysis
description: Analyzes Perfetto traces to find the root cause of latency, memory, or
  jank issues in Android apps. Use when the user provides a Perfetto trace file and
  asks any question, ongoing investigation, or open-ended request to analyze its contents.
license: Complete terms in LICENSE.txt
metadata:
  author: Google LLC
  last-updated: '2026-05-14'
  keywords:
  - Perfetto
  - trace analysis
  - Android performance
  - debugging
  - profiling
  - jank
  - bottleneck
  - SQL
---

## Resources

- **Domain Hints:** Reference files for specific performance areas: [`CPU`](references/hints_cpu.md), [`Graphics`](references/hints_graphics.md), [`I/O`](references/hints_io.md), [`IPC`](references/hints_ipc.md), [`Memory`](references/hints_memory.md), [`Power`](references/hints_power.md). These files each contain multiple expert-vetted, powerful trace analysis techniques to steer and aid in the analysis.
- **Perfetto SQL Reference:** Reference guidelines for translating intents into valid queries are located in [the SQL reference](references/sql.md). You must read this reference and follow its Execution Protocol for all SQL generation.

## Setup Phase

1. Keep a concise evidence scratchpad in task-local work storage, not beside the input trace unless requested. Reuse the current task’s evidence when continuing it; give a new investigation a distinct filename. Record verified timestamps, identifiers, states and separately labeled hypotheses.
2. Read only the domain hints relevant to the reported symptom. Read [SQL guidance](references/sql.md) when generating queries; resolve the processor in existing tool locations or task-local storage, without modifying the source repository.
3. Identify the app from the user’s request and trace evidence. If multiple plausible targets remain and the choice changes the diagnosis, ask; otherwise state the selected target.

## Investigation Protocol

Follow this loop until the scoped question is supported by evidence or a concrete capture limitation prevents further diagnosis:

### 1. Formulate Hypothesis

- **Prioritization:** Form hypotheses using information from: user prompt \> "Domain Hints" ([`CPU`](references/hints_cpu.md), [`Graphics`](references/hints_graphics.md), [`I/O`](references/hints_io.md), [`IPC`](references/hints_ipc.md), [`Memory`](references/hints_memory.md), [`Power`](references/hints_power.md)) \> general knowledge. Be sure to leverage these "Domain Hints" as they are expert-vetted analysis techniques.
- **Source Attribution:** Explicitly mention the source of your hypothesis (e.g., "Based on hints_io.md...").
- **Focus Constraint:** Focus on the primary bottleneck. Avoid investigating deep into binder transactions unless the user explicitly asks for it or there is no other obvious bottleneck.
- **State Reasoning:** Briefly state your reasoning based on previous findings *before* generating a new query.

### 2. Plan and Collect Data

- **Metrics First:** Start with a high-level view using trace metrics before diving into custom SQL (e.g., `./trace_processor --run-metrics
  android_startup`).
- **Broad to Narrow:** Begin with broad queries using minimal filters. Favor fuzzy matching (e.g., `GLOB '*abc*'`) over exact matching.
- **Overlapping Time:** When filtering by time, you MUST check for events that overlap with the target time range (e.g., `start1 < end2 AND start2 < end1`) to ensure you don't miss slices that span across the boundaries.

### 3. Analyze and Drill Down (Depth-First)

- **Evidentiary Rigor:** Do not draw conclusions without explicit data.
- **Wall Time vs. CPU Time:** Do not assume a long-running slice is actively computing. You MUST query the `thread_state` table for the exact timestamp window of suspicious slices to verify if the thread was `Running`, `Runnable` (waiting for CPU), or `Sleeping`/`Uninterruptible Sleep` (blocked).
- **Follow Dependencies:** Trace the relevant blocker across processes when the capture supports it. If required events are absent, report the missing evidence and the additional capture needed; do not infer a cause from waiting alone.

### 4. Check scope and remaining uncertainty

Check for other bottlenecks only when they could materially change the answer. A disconfirmed hypothesis warrants a targeted alternative, not unlimited system-wide exploration. Stop when the supported causal chain answers the scoped question, or when further progress requires missing events, another capture or a user decision. Distinguish verified cause, likely contributors and unresolved limitations.

## Final Report

Explain the finding, its evidence, affected interval and practical implication. State any missing capture evidence and include the retained query/scratchpad path when useful. Do not claim that all other bottlenecks have been ruled out, and do not require a canned closing sentence.

## Final Report

Only when you have followed the entire chain of dependencies to the root
cause(s) AND confirmed through exhaustive search that no other major bottlenecks
exist: 1. Summarize your findings detailing the verified chain of evidence. 2.
Conclude with: "This concludes the trace analysis. You can review the full chain
of evidence in \[scratchpad_filename\]. Let me know if you would like me to drill
down into any of these specific threads, or if you'd like help drafting a bug
report."
