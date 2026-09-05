# KPI status and operating readouts

Use current observed actuals for a real status update. Placeholders or synthetic rows are appropriate only for an explicitly requested template/demo and must be labeled. If a required actual cannot be obtained, show that limitation rather than inventing status.

## Comparable numbers

Establish the metric definition, population/grain, source, completeness cutoff, timezone and comparison window. Reproduce the headline total before interpreting it. Call out partial periods, backfills, definition changes, tracking outages and denominator shifts; restate comparable history when possible.

Show actual, comparison, absolute change and relative change when meaningful. When the baseline is zero or negative, explain why a percentage change is undefined or misleading instead of emitting a confident growth percentage. Do not average rates with incompatible denominators or mix cumulative and per-period metrics.

## Target and pacing

Use a target and pacing definition only when supplied, established by authoritative context or explicitly calculated with disclosed assumptions. Compare actuals with the appropriate elapsed-time expectation for deadline-based goals. Linear pacing is an assumption that may fail with seasonality or uneven capacity. Distinguish “target missing” from “off target.” Status colors need text labels and an explicit basis.

## Drivers and implications

Use already validated driver evidence when available. Request `metric-diagnostics` for unresolved investigation, then preserve the distinction between measured contributions, plausible explanations and business events that only coincide with the movement. Use an additive bridge only when its components reconcile to the total; show the residual or explain a non-additive relationship.

Report the few facts that change the operating decision: whether movement is broad or concentrated, its material scale, whether the current trajectory threatens the actual goal, and a supported action or remaining diagnostic gap. Preserve recurring definitions and sections where they support comparison across readouts, without forcing a full report for a short question.

For a durable report, hand the verified actuals, metric contract, target/pacing basis, drivers, caveats and audience to `build-report`. For an inline readout, a compact table plus a sourced conclusion is sufficient when it covers the request. Do not schedule a recurring report simply because the content is a WBR/MBR.
