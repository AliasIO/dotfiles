---
name: product-business-analysis
description: "Answer evidence-backed product/business decisions, define KPIs and targets, prepare KPI readouts, and gather the context those tasks need. Use focused references for the selected mode; routine factual lookups do not require an analytics workflow."
---

# Business analysis and KPI decisions

Start from the user's decision or requested readout. Reuse the supplied context and authoritative definitions; ask only for gaps that would materially change the answer. Do not load all modes or require an intake interview.

## Choose the needed method

- **Business or product decision:** compare relevant options, populations and normalized outcomes. Use [decision analysis](references/decision-analysis.md) when interpreting tradeoffs or prioritizing opportunities.
- **Missing meaning, source ownership or recent context:** use [context and sources](references/context-and-sources.md). Skip retrieval when the prompt is self-contained; continue the user's downstream task once the gap is resolved.
- **Define metrics, guardrails, targets or measurement plans:** use [KPI design](references/kpi-design.md). Reconcile disputed existing numbers with `analyze-data-quality` before redesigning their definition.
- **KPI status, scorecard or operating readout:** use [KPI readouts](references/kpi-readouts.md). Keep actuals, targets, comparison periods, pacing and driver evidence distinct.

Use `metric-diagnostics` when explaining a movement needs fresh driver investigation, `market-sizing` for a market-size model, and `analyze-data-quality` when the source data itself may be untrustworthy. Use `validate-data` for material methodological or evidentiary uncertainty before a decision. These routes should resolve a real need, not become mandatory extra stages.

## Shared evidence and delivery

Follow [runtime and scope](../index/references/runtime-and-scope.md) for bounded source discovery, output and publishing authority. Preserve grain, denominators, time windows, source freshness and comparable definitions. Required unavailable evidence limits the affected conclusion; continue independent work with explicit uncertainty.

Keep executed queries and calculations inspectable. A notebook is useful when requested or when multi-step reproducibility warrants it, not for every query. Give a sourced inline answer when sufficient; complete a requested report, dashboard, document or other artifact using the actual available delivery route.

Lead with the supported result or recommendation and explain the evidence and material limitations. Separate observations, hypotheses, causal claims and proposed actions. Persist semantic layers, schedule monitoring, or publish to a destination only when authorized.
