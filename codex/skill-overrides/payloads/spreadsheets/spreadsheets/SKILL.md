---
name: "Spreadsheets"
description: "Create, edit, analyze, and verify standalone spreadsheet files or Google Sheets-ready workbooks, including .xlsx, .xls, .csv, and .tsv. Do not use for live controlling Microsoft Excel app or a live Excel session."
---

# Spreadsheets skill
Read entirely for spreadsheet creation, editing, analysis, or visualization.

## Decision Boundary
- Google Sheets targeted outputs also require `routing/google_sheets.md`. Otherwise, author local files with artifact tool.

## Important Instructions
- For new workbooks or authorized redesigns, plan the simplest correct workbook that meets the task, audience, actual data and domain. If formulas become hard to read, first reconsider whether the workbook’s structure, layout, or logic is overcomplicated before simplifying individual formulas. Remove unnecessary or duplicated logic while preserving calculation correctness, required business relationships, and financial reconciliation
- Instruction precedence for workbook content, layout, and formatting is: user request > reference/template > domain defaults/conventions > general defaults.

## Tools + Contract Requirements
- Author spreadsheet with `@oai/artifact-tool` JS and only `load_workspace_dependencies` executables/dependencies, never repo-local deps. If unavailable, check `~/.cache/codex-runtimes/codex-primary-runtime/dependencies/`. Never modify dependency directories.
- In a writable, conversation-specific or tmp directory, create a `node_modules` symlink or Windows junction to the loader `node_modules`.
- Prefer to patch/rerun one `.mjs` builder. No heredocs or duplicate builders.
- Use the provided API reference. Do not inspect package internals or prototypes. If blocked, run at most one targeted `workbook.help("<api_or_feature>")` query.
- No `openpyxl`, `xlsxwriter`, or `pandas.ExcelWriter` authoring unless asked, or  `@oai/artifact-tool` is unavailable.
- Analyze with JS/formulas, else bundled Python (libraries) and JSON/CSV intermediates; other libraries only for missing capabilities.
- Use `update_plan` for complex work.
- In your final response, omit builders, previews, or other support files unless requested.
- Resolve `SKILL_DIR` to the absolute directory of this loaded skill and `NODE_BIN` to the Node executable returned by `load_workspace_dependencies`. Use those paths for bundled helpers; do not assume the shell is in the skill directory.

Immediately before the first create/edit authoring command, run `mark_artifact_operation_started.mjs` successfully exactly once using the command below. Do not run it for read-only work. For edits, replace `create` with `edit`; adjust the expected count and output format to match the requested outputs.
  ```bash
  "$NODE_BIN" "$SKILL_DIR/container_tools/mark_artifact_operation_started.mjs" --operation-kind create --expected-output-count 1 --output-format xlsx
  ```

## Writing Quality and Authored Content
For newly authored content, including additions during edits:

- Write for intended audience. Never include internal file paths, authoring commentary, planning notes, or requester instructions in the artifact unless explicitly requested. Do not repeat audience or style directives such as “executive-friendly” in headings, content, or comments.

- Use concise, literal subject titles and labels. Put company, timeframe and source context in subtitles or nearby notes.
  - Good: `Weekly metrics`. Bad: `Follow the weekly trends`
  - Good: `Monthly results`. Bad: `Decision-ready monthly impact analysis`
  - Good: `Income and household assumptions`. Bad: `Same paycheck. Different purchasing power.`

- Prefer direct, specific human wording. Avoid slogans, buzzwords, invented terminology, vague framing and formulaic claims.
  - Good: `Contributions decreased`. Bad: `Contributions waned`
  - Good: `Permanent drop in commuting`. Bad: `Structurally lower commute base`
  - Good: `Revenue metrics`. Bad: `Strategic Value Drivers`

- Avoid AI-like sentence constructions when simpler wording is clearer:
  - Semicolons: `Travel demand and employment from Jan to Feb. Persistent behavior shifts are shaping recovery.` not `Travel demand and employment fell from Jan to Feb; persistent behavior shifts are shaping the path back.`
  - Passive voice: `The team approved the proposal.` not `The proposal was approved by the team.`
  - Contrast slogans like `It’s not X, it’s Y`: `Humidity exposure over time` not `Humidity is an exposure trajectory, not a setpoint.`

- Keep wording factual, parseable and supported by the workbook.
  - Good: `Transit use is at 79%, matching pre-pandemic levels`
  - Bad: `79% Transit use back to pre-pandemic`

- Avoid AI-style decoration in titles and labels: bullets, icons, emoji, pipe-delimited titles, decorative arrows, or generic suffixes such as `review`, `impact`, `analysis`, or `dashboard`.
  - Good: `$ in USD`
  - Bad: `$ in USD • monthly • forecast`

- For checks and logic, be specific:
  - Bad: `Signal integrity: BLOCKED`. Good: `Missing input: forecast rate` (a specific functional warning)

- Do not include motivational wording, self-assessment, repeated setup. Do not add decorative badges, confidence ratings, status tags or PASS/WARN/BLOCKED banners.
  - Bad: `This workbook is source-backed and ready for review`. Omit the self-assessment, and keep needed sources and limitations besides analysis if actually useful.

User requests and preferences always take priority. For edits, follow existing writing style in the workbook.


## Workflows
Required:
- `workflows/edit_workflows.md` for existing files/follow-ups.
- `workflows/create_workflows.md` for new files

## Resources
Read the following BEFORE starting the task:

Required:
- `artifact_tool_docs/API_QUICK_START.md` for `artifact_tool` JS API documentation. Read entirely.
- `style_guidelines.md` for formatting.

As applicable:
- `references/template-elicitation.md`: if user has not provided a template, reference, or visual direction.
- `references/image-references.md`: if a reference image or screenshot is provided.
- `references/read_only_qna.md`: for Q&/audits
- `features/charts.md`: for creating or editing charts.

## Domain Requirements
Read only relevant guidance:
- Finance and investment banking: `domain_guidance/financial_models.md`
- Corporate finance and FP&A: `domain_guidance/corporate_finance_fpa.md`
- Healthcare: `domain_guidance/healthcare.md`
- Marketing and advertising: `domain_guidance/marketing_advertising.md`
- Scientific research: `domain_guidance/scientific_research.md`

## Create and Edits
For any task that requires modifying or creating a workbook:

### Formula Correctness
Apply to newly added or edited formulas, alongside the relevant create/edit workflow.

- Keep raw data, assumptions, editable mappings, scoring rules and thresholds in labeled inputs/tables. Mathematical, index and control constants may remain in formulas.
- Keep calculated outputs formula-driven so they update with inputs. Use consistent patterns across comparable rows and projection periods, preserving intentional differences. Reuse shared results; keep independent reconciliation checks independent.
- Use the simplest correct, human-readable formula. Formulas must be **easily auditable**. Do not perform complex calculations in a single cell when possible. Instead, use helper cells for intermediate values, direct references, arithmetic, aggregates and lookups like INDEX/MATCH/XLOOKUP, SUMIFS etc. Use supported LET, IF or arrays only when they improve clarity. Users should be able to trace the model from inputs to outputs easily.
- Reuse results or shared checks only when inputs, periods, units, rounding and overrides match; gate only affected outputs. Add helpers for meaningful repeated work, not trivial expressions; narrow edits do not authorize new helper ranges. Compute shared intermediate calculations once in labeled helper cells.
- Make formulas copy/fill-safe: reference destination headers/IDs, anchor only fixed sources, and use keyed lookups when layouts differ. Derive period filters/labels from destination keys;
- Quote cross-sheet names, e.g. ='Sheet Name'!A1.
- Keep workbook validation useful and proportional to realistic input risks. Reuse checks and separate them from calculations. Block outputs only when invalid inputs would make them misleading; do not invent business restrictions to validate inputs.
- Handle expected missing/invalid inputs explicitly; avoid blanket IFERROR wrappers or plausible-zero substitutes for unexpected errors. When simplifying, preserve calculation meaning, intended blank/error behavior, one-offs and overrides. Remove redundant guard layers while preserving checks that expose invalid source data.
- Scale verification to complexity and risk: check references/results for simple formulas; test representative inputs, copies and affected outputs for complex or consequential calculations. Keep authoring-only tests out of the workbook.
- For source-backed analyses, spot-check representative outputs and reconcile key totals with source definitions.
- Use numeric tolerances consistent with required calculation precision; compare identifiers, integer counts and categories exactly.

### Data Formatting Rules
- Store numbers, percentages, currency, and dates as typed spreadsheet values, not preformatted strings. Use text only for true identifiers such as ZIP codes, account IDs, SKUs, or labels.
- Use Excel-invariant number/date format codes, not locale-specific display strings. Generic examples include `#,##0`, `#,##0.0`, `0.0%`, `0.00%`, `"$"#,##0`, `"$"#,##0.00`, `yyyy-mm-dd`, `mmm yyyy`. Existing workbook/reference, and domain conventions take priority;
- Percentages: Follow the domain or reference's precision. Otherwise, use 1 decimal for most analytical cells, 0 decimals for dashboard outputs, and 2 decimals where small rate differences matter.
- Do not swap `.` and `,` in format codes to mimic locale separators; separators are controlled by spreadsheet/render locale. Use `0.0%`, not `0,0%`, and `#,##0`, not `#.##0`.
- Choose the appropriate format for readability. Match precision to meaning: counts use `#,##0`; rates usually use `0.0%` or `0.00%`; currency uses whole units unless cents matter.

### Verification Rules
Before final response, apply these checks within the authorized changes and their dependencies. Report unrelated pre-existing defects without repairing them.

1. Inspect key ranges:
```js
const check = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:H20",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 12,
});
console.log(check.ndjson);
```

2. Scan formula errors:
```js
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);
```

3. Render sheets/ranges to verify visual output (skip if already verified and no style changes):
```js
const blob = await workbook.render({ sheetName: "Sheet1", range: "A1:H20", scale: 2 });
```
For creation or broad authorized restructuring, visually review every sheet. For a narrow edit, review the changed view and affected dependencies, then compare all tabs with the source for unintended value, formula, object, validation or style changes. Do not repeatedly render unchanged tabs; investigate any scope-preservation failure.

Visual requirements:
- Fix severe defects before finalizing: blank/broken charts, low-contrast text, unreadable font sizes, clipped headers/numbers or chart data/axis labels, obvious formula errors, default blank sheets, or content outside the visible working area.
- Ensure logical labels or titles appear once and have a clear layout
- Ensure text is visible and columns/rows are appropriately sized; verify chart labels, axis ticks and fonts at normal zoom.


4. Keep verification compact:
- Use Artifact Tool to verify requested features and results, reusing checks for unchanged content.
- Investigate the saved file further only when there is a specific export concern.
- Avoid arbitrary formula count checks, assumptions about file storage, and huge NDJSON dumps.

5. Export:
```js
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/output.xlsx`);
```

6. Finalize immediately after successful export and checks above.
- Do not export extra `.xlsx` variants unless asked.

### Citation Requirements
- Cite sources inside the spreadsheet
- Use plain-text URLs in spreadsheet cells.
- For financial models, preserve provenance through existing source conventions, a compact source table or an existing supported cell annotation. Prefer a table for repeated inputs; do not force a new table into a narrow edit.
- Do not add cell comments or cell notes unless the user requests them. Preserve existing annotations; put needed new source or assumption context in ordinary cells within scope.
- For researched row-wise data tables, include source URLs in a dedicated source column.
- When comments are requested, keep them succinct, minimal and easy to read.
- Use one supported annotation path per cell; update an existing note/thread rather than layering another system over it. Reject duplicate cell references in a legacy comment part. Repair the authoring path rather than deleting provenance to make export succeed.

## Completion Criteria
### Criteria for Question / Read only requests
- Answer from the available workbook context. Do not edit or overwrite unless the user asks for a workbook change.

### Criteria for all create and edit requests
Complete only when:
- Content is populated, addresses the user's request, and formulas compute, with no obvious formula errors in key scanned ranges (including bad-reference, off-by-one or circular errors).
- `.xlsx` saved to `outputs/<unique_thread_id>/`.
- Visual verification passes: organized, legible layout matches requested style or default/existing edit baseline; all important numbers/callouts are visible; numbers, text, charts and content are unclipped without awkward wrapping.
- Required controls, charts, panes and requested features exist.

## Error Recovery
On first tool or API error:
1. Read error text.
2. Consult the selected workflow's targeted help or schema discovery only if needed.
3. Retry with minimal patch (not full rewrite).
4. Continue from existing workbook state.

Do not loop indefinitely on similar failures.

## Final response citations

Place :codex-file-citation{...} inline in prose without wrapping it in backticks or a code block, not in a trailing list. Use `purpose="source"` for Q&A/no-op and `purpose="output"` for create/edit.

- [HARD REQUIREMENT] Create/edit: cite each final workbook exactly once with a plain output citation. Summarize representative changes; do not cite every sheet/range or add a separate filename, path, or Markdown link. Example: `Created :codex-file-citation{path="/abs/path/inventory.xlsx" purpose="output"} with formula-driven status and a summary.`
- Q&A: cite whole-workbook claims plainly; otherwise use the narrowest reliable `sheet` + `range` (the exact cell for a discrete value). Cite discontiguous cells separately. For objects, use `sheet` + exact inspected `object_id`; add `object_kind`/`label` only when useful. Never cite a sheet alone or guess locators.
- Calculations: cite only distinct inputs, drivers, formulas, or results the answer needs.

:codex-file-citation{path="/abs/path/book.xlsx" purpose="source" artifact_kind="workbook" sheet="Revenue Model" range="C27"}

Never cite intermediates unless asked.

## Comment Author
- If the authenticated/user profile or env context provides a user display name, use it as the threaded comment display name unless the user requests another name. Default to `User`.

## Source, PDF, and Attachment Processing
- Keep source notes compact: record file name, section/table label, and enough context to audit the number. Do not paste large PDF excerpts into the workbook unless requested.
- Bundled Python libraries available in the bundled runtime environment for extraction/analysis include `pandas`, `numpy`, `pypdf`, `python-docx`, and `reportlab`. You may read/extract in separate scripts if needed.
- Bundled JS libraries available for document/PDF work include `docx`, `pdf-lib`, and `pdfjs-dist`.
