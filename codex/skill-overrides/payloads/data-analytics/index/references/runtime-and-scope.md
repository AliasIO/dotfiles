# Analytics scope and delivery

Use this contract when choosing the extent of analysis, an artifact, or a destination. Higher-priority host instructions and the user's requested output control the choice.

## Scope and sources

Start with the question, existing context, authoritative metric definitions, and named or directly relevant sources. Inspect the schemas and freshness needed for the actual query. Expand discovery when an unresolved definition, gap, conflict, or surprising result could change the conclusion. Do not search every connected source by default. Reconcile conflicts using ownership, freshness, grain, coverage, and directness; record the choice. A semantic layer is a starting map whose relevant definitions still need verification.

Stop a path whose required source is unavailable; explain what is missing. Continue independent work and optional enrichment with labeled limitations. Preserve executed SQL, query links, calculations, and timestamps in working evidence without creating a notebook for every query. Create a notebook when requested or when reproducibility of multi-step analysis benefits from one. Save semantic layers or recurring automations only when requested.

## Output and runtime

- Answer a direct analytical question inline when that fully conveys the evidence, uncertainty, and recommendation. A skill being loaded does not itself require a report, a mode switch, or publication.
- Build a durable report, dashboard, notebook, workbook, document, or deck when requested or needed for the work. An explicitly requested artifact must be completed and checked; a short chat summary cannot replace it. Choose one primary deliverable unless multiple outputs are requested or required by the selected conversion path.
- Honor the destination and access scope already selected by the user. Otherwise use an available host-supported artifact surface or a portable local file appropriate to the request. Do not infer tool or renderer availability from a product name, directory, or mode label. Discover callable tools through the host's supported discovery mechanism; follow any explicit native renderer contract actually supplied in the session.
- For inline visuals, use a supported native renderer when available and useful; otherwise create and inspect a reproducible static chart. Use a compact table when exact values are the point or no honest chart can be delivered. Do not emit a guessed widget protocol or claim unseen output rendered successfully.
- Use Sites only when the requested destination, prior authorization, or an explicit applicable host delivery contract authorizes that destination. A Work Mode label alone does not authorize publication or wider access. Check the full create/checkpoint/deploy lifecycle before selecting it; keep existing reader access unless an authorized change requires otherwise.
- Use the existing canonical artifact manifest, snapshot, source metadata, validation, and packaged builder for Data Analytics HTML/MCP/Sites reports and dashboards. Do not invent a second chart runtime to bypass validation. For HTML, package with the plugin's `report:deliver` command as documented in `src/analytics-app-core.md`.
- After one targeted correction for a failed surface, use a suitable available fallback and disclose the limitation. If the user required only the failed destination, report that blocker and retain reviewable work rather than silently substituting it.

## Completion

Validate source grain, periods, denominators, totals, and claims before presentation QA. Inspect the final artifact in its actual surface. Distinguish verified findings, hypotheses, and limitations; provide source links and a snapshot timestamp where relevant. A tool call or local preview URL alone is not evidence of published delivery. Finish when the requested decision or artifact is supported, or state the concrete remaining blocker.
