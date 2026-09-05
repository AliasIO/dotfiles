---
name: index
description: "Route Data Analytics plugin-level requests and broad analytics work to the right focused workflow. Use when Data Analytics is at-mentioned, or for analytics requests involving data, metrics, dashboards, reports, charts, notebooks, spreadsheets, KPIs, market sizing, or semantic layers."
---

# Data Analytics router

Use this router for broad analytics requests or an explicit Data Analytics mention. A focused request can go directly to its matching skill. Quantitative analytics covers metric definitions, business/product decisions, data quality, and evidence-backed reporting; a general factual lookup or unrelated writing request does not need this workflow.

Start with the user's actual question and supplied context. Clarify only missing information that would materially change the analysis, source access, or deliverable. Continue useful independent work while a question is pending. Do not require a mode change or a fixed intake interview before actionable analysis.

Read [runtime and scope](references/runtime-and-scope.md) when choosing source breadth, a delivery surface, or publication. Use relevant connected tools, uploaded files, and existing project evidence; inspect available tools rather than assuming a named integration exists. Do not install plugins automatically or invent unavailable discovery tools. Follow the host's plugin installation contract when the user requests an integration.

## Choose the workflow

| Requested work | Primary workflow |
| --- | --- |
| Business decision, missing context, KPI definition or operating readout | `$product-business-analysis`, choosing only the needed reference |
| Explain metric movement or discrepancy | `$metric-diagnostics` |
| Decide launch, segment, or business direction | `$product-business-analysis` |
| Estimate TAM, SAM, SOM, or opportunity | `$market-sizing` |
| Check source grain, freshness, completeness, or reconciliation | `$analyze-data-quality` |
| Validate an analysis, claim, or recommendation | `$validate-data` |
| Create a requested report or dashboard | `$build-report` or `$build-dashboard` |
| Build or review quantitative visuals | `$visualize-data` |
| Reproducible notebook | `$jupyter-notebooks` |
| Explicitly save or repair a semantic layer | `$create-data-context` |
| Authorized Sites publication | `$publish-artifact-to-sites` |

For a metric definition dispute, establish the controlling definition and reconcile sources before diagnosing movement. For a product decision, evaluate the decision rather than substituting a dashboard or generic overview. Use validation and context skills only where their added work can affect the answer.

## Evidence and saved context

Read a named or readily discoverable semantic layer when relevant. Verify the selected source and definitions through current evidence; surface material conflicts rather than treating stored context as authority over current facts. Do not create or refresh saved context without a request.

Use bounded queries and aggregate extracts by default. Keep confidential rows out of externally shared artifacts unless required and authorized. Record source URLs, query references, metric definitions, comparison periods, and important caveats. Include full SQL in the response only when requested or necessary; retain it in the working evidence otherwise.

## Orientation and samples

For a broad help request, briefly explain the relevant capabilities and suggest a useful starting question based on available context. A fixed three-option interview is unnecessary. If required sources are missing, identify the specific source or file that would unlock the task and offer an appropriate fallback without inventing results.

Use synthetic data only when the user selects a demo or sample. If they explicitly request this plugin's sample without supplying another, use [demo-product-growth.csv](../../assets/demo-product-growth.csv), label it synthetic, and keep demo findings separate from real business claims.

## Delivery

A concise, sourced answer is sufficient for a direct question. Use a durable artifact when requested or useful for the required detail. Native documents, slides, and PDFs should follow the actual available artifact or conversion skills; do not assume an uninstalled conversion skill exists. Preserve the requested format and validate the final result. Follow through from context gathering to the requested conclusion instead of stopping at an intermediate handoff.
