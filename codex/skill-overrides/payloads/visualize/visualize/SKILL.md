---
name: visualize
description: "Create visualizations and interactive tools directly in conversation. Proactively use to show how something works; explore 'what happens when', 'what changes', or 'help me understand'; compare or inspect; create simulations, maps, charts, graphs, and mockups. Use standard tools for static scientific figures."
---

# Visualize

- A request for a new standalone file, website, app page, component, or other
  project change is not an in-conversation visualization request, even when the
  deliverable contains charts or interactive content.
- A request to preview, explain, or explore a proposed interface in the
  conversation is an in-conversation visualization request.
- Create a visual only when the user needs to see or explore it in the
  conversation and it materially improves the explanation. Do not create an
  inline visual merely because the request involves data, charts, or an
  interactive page.
- Use a normal Markdown table when the user asks for a table; return it directly
  and do not create a visualization file.
- Use Mermaid when labeled nodes and edges fully explain a static structure;
  return a normal fenced Mermaid block and no visualization file. Use HTML for
  dynamics, spatial motion, adjustable inputs, and other visuals.
- Follow the active host’s communication requirements, including skill-use notices and progress updates. Keep those updates concise and focused on the user’s result.
- In user-facing prose, describe only what the visual helps the user see or
  decide. Keep it concise and do not repeat information already clear from the
  visual. Include implementation details only when they help the user or the host requires them.

## Context compaction

Retain the selected output route and any unresolved validation work across compaction. Re-read a relevant instruction only if it is missing or has changed; do not require repeated loading of all design examples.

## Inline HTML output contract

### File

- For each new or updated visualization, choose a concise ASCII
  lowercase-hyphenated title and write `<title>.html` in an explicitly writable,
  durable, task-owned location. Prefer the thread-scoped visualization directory
  when it appears in the writable roots. Otherwise, use the task's supplied
  `work/` directory or create an output directory under its authorized
  working directory.
- Never save inline visualization fragments to Library; they are response content, not user-facing file deliverables.
- Never add `sandbox:` links to inline visualization HTML unless the user specifically requests a download.
- Do not choose system temp as a separate fallback. Write access alone does
  not guarantee that the conversation can read the file.
- Use the absolute path on the executor that creates the file. Never assume
  `~/.codex` is writable unless its thread directory appears in the writable
  roots.
- Build the visual in the conversation. Use the open project when the user asks
  for a site, app page, component, or change to existing project files.

### Fragment

- Write only an HTML fragment: no `<!doctype>`, `<html>`, `<head>`, or `<body>`.
- Write literal markup: use `<div class="card">Hi</div>` plus a real newline,
  never `<div class=\"card\">Hi</div>\n`. Never embed the fragment in an inline
  Python, JavaScript, or shell string. Read it back; rewrite literal `\"` or
  `\n`.
- Keep CSS and JavaScript in the fragment only when base classes are
  insufficient. Load static resources only from the CDN allowlist. Never use
  `fetch`, XHR, WebSocket, or other API calls.
- Give the fragment root a unique ID and select it with
  `document.getElementById(...)`. Never derive the root from
  `document.currentScript`; scripts may sit outside the root.
- Keep visualizations under 1 MB. Aggregate, bin, downsample, reduce precision,
  or drop unused fields from large inline datasets.
- Check that JavaScript has no undefined identifiers, every queried element
  exists, and the primary interaction updates the visual. The bundled
  `python3 scripts/render.py <absolute-fragment-path> [<destination>.html] [--serve]`
  can wrap a fragment as standalone HTML or temporarily serve it for browser
  inspection when a preview would help with layout, theme, or runtime behavior.

### Content and response

- Keep the fragment focused on the visualization. Do not include explanatory
  paragraphs, formulas, instructions, or narrative callouts. Include only
  necessary labels, legends, values, and accessible text alternatives.
- Use the normal response flow. Put any necessary concise explanation outside
  the fragment, and add this visualization content reference on its own line
  where the visual should appear, using the absolute executor-side file path:

```text
visualize{"path":"<absolute-path>/<title>.html"}
```

- Add `"mode":"wide"` for a full-screen desktop app mockup, including its
  application shell. For other visuals, add it only when several compact chart
  panels must remain side by side for direct comparison and would be unreadable
  at the normal width. Never widen a single plot, map, grid, diagram, or
  timeline merely because it is dense. Keep contained mockups, dialogs, and
  mobile screens at normal width; stack separate self-contained views
  vertically. Wide visualizations render in an expandable inline surface up to
  1,024px:

```text
visualize{"path":"<absolute-path>/<title>.html","mode":"wide"}
```

- Whenever you create or update an inline visualization, include its content
  reference in that same turn's final response, even when editing an existing
  file or reusing a path shown in an earlier turn.
- The JSON object may also include a `title` when needed.
- Emit only the content reference for the fragment. Never announce it as an
  artifact, website, output, attachment, link, or download, and never add a
  Markdown link to it. Do not append a Markdown table or repeat the visual's
  data; add at most one short conclusion when the user needs an explanation.

### External resources

- The CSP allows only `cdnjs.cloudflare.com`, `esm.sh`, `cdn.jsdelivr.net`,
  `unpkg.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, and
  `fonts.bunny.net`. Other origins are blocked and fail silently.

## Exporting an existing visualization

- Keep the fragment as the editable inline source. When the user explicitly asks
  to save, export, or publish a visualization that is already shown in the
  conversation, render it with
  `python3 scripts/render.py <absolute-fragment-path> <destination>.html`.
- Apply this export flow only when the user explicitly asks to turn the existing
  inline source or visualization into a website. For a general website request,
  build a new responsive site in the output directory or open project, using
  Sites when appropriate, without applying this skill's guidance.
- If the visualization calls `window.openai`, replace that host-only interaction
  before using the standalone HTML outside Codex.
- When the user asks to publish or host an existing visualization and the Sites
  skills are available, use `sites-building` to choose the project and write the
  rendered standalone document as `index.html`, then use `sites-hosting`.
- If Sites is unavailable, offer the standalone HTML without claiming it was
  published.

## Composition and layout

For a new or substantial visual layout, read [composition and accessibility guidance](references/composition-and-layout.md). Use the relevant parts when revising an existing visual.

## Typography

- Scale type with `--font-size-base`. Use normal text by default and `.text-small` only for secondary annotations; at the default scale these are 14px and 12px. Never make supporting text smaller than 11px.
- `h1`, `h2`, and `h3` are available; use one concise visible heading for a
  self-contained chart or graph, with short panel headings only when needed.
  Do not restate the prompt or add a redundant title to other visualizations.
- Use only weights `400` and `500`. Never set custom font sizes or line heights.
- Use `.tabular-nums` on changing or aligned numbers. Avoid it for editorial or
  decorative numerals.

## Color

- Make every fill, stroke, text, border, shadow, chart, and canvas color
  theme-aware. Never hardcode light or dark palettes such as white panels,
  off-white backgrounds, black text, slate strokes, or Tailwind color literals.
- Keep text readable against its actual background. Muted or secondary colors
  must retain clear contrast; never use `.text-muted` inside `.card` or another
  filled container unless its background preserves that contrast.
- Available theme variables include `--background`, `--foreground`, `--card`,
  `--card-foreground`, `--popover`, `--popover-foreground`, `--primary`,
  `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--muted`,
  `--muted-foreground`, `--accent`, `--accent-foreground`, `--destructive`,
  `--border`, `--input`, `--ring`, `--blue`, `--orange`, `--green`, `--red`,
  `--purple`, and `--yellow`. Use `currentColor` inside SVG.
- Never add decorative borders, outlines, or strokes to progress tracks,
  meters, bars, stacked segments, or other filled quantitative marks. Use a
  subtle neutral or translucent track and distinguish marks with fill,
  contrast, spacing, or opacity.
- Use `--viz-series-1` for one measure or active state. Use `--viz-series-2`
  through `--viz-series-6` only for important persistent category, series, or
  status identity; never give every peer a different color by default.
  - For categorical tiles or nodes, prefer a soft low-opacity series fill with a
    neutral or transparent border; never color every outline.
  - Keep mappings stable and pair color with labels, shapes, or line styles.
  - Secondary series colors are theme-derived; never assume hues or use them
    decoratively.
- When color encodes a category or series, apply it consistently to the
  corresponding visual marks—not just the legend—and keep large-area fills
  subtle.
- Use series colors only for chart lines, marks, and legend swatches. Keep
  values, axis text, and direct labels in `--foreground` or
  `--muted-foreground`.
- Keep chart grids and inactive structure thin and neutral. Use 1-2px neutral
  structural paths; never thicken, dash, or double-stroke the whole structure.
- In each color pair, the base token is a surface and its `-foreground` token is the content on that surface. Use `.btn-primary` for high-emphasis actions; its neutral fill is supplied by the utility. Use `--primary` and `--primary-foreground` for filled selected, active, or pressed controls. Reserve `--accent` and `--accent-foreground` for subtle interactive surfaces and soft highlights. Buttons with `aria-pressed="true"`, `aria-selected="true"`, or `.is-selected` already use the primary pairing; `.nav-pills .nav-link.active` keeps selection neutral.

## Design system

Use [design-system details](references/design-system.md) when selecting components or styling a new visual. Preserve an existing user-approved design for focused edits.

## Charts

- Prefer inline SVG for simple charts and version-pinned approved-CDN
  libraries when native interaction, scales, legends, or layout materially
  improve the result.
- Resolve theme colors before passing them to canvas or chart APIs that cannot
  parse CSS variables or `light-dark(...)`; redraw when the theme changes.
- Use a tooltip unless it would distract from a simple, directly labeled chart.
  Keep chart-library tooltips and grouped legend interactions native; never
  replace them with a custom one-point tooltip. For SVG, attach `data-tooltip`
  directly to the real pointer-accessible mark and include its label, value,
  and units; the sandbox handles themed positioning, keyboard focus, and touch.
- Animate transitions between chart states so lines and marks move to their new
  values, resampling paths when point counts differ. Do not animate initial
  appearance or use fade-only effects; never loop motion, and honor
  `prefers-reduced-motion`.
- Scope SVG styles to the chart class. Never target every `svg` in a container
  that also contains Lucide icons.
- Include labeled axes, units, and directly labeled important values. Give every
  chart, SVG, canvas, and widget a concise screen-reader summary using a role and
  accessible name or description, SVG `<title>`/`<desc>`, fallback text, or an
  `.sr-only` heading or description.
- Reserve space for the longest formatted label at every supported width. Axis
  ticks are secondary and may use `.text-small` when space is tight. Never
  overlap or clip text against marks, axes, legends, labels, or edges; move or
  reduce labels rather than squeeze them.
- Add a legend only when multiple series cannot be labeled directly.
- Pair color with shape or text so meaning never depends on color alone.

## Icons and mockups

- Use the sandbox-provided global `lucide`. Add an icon name with `data-lucide`:

  ```html
  <i data-lucide="search" aria-hidden="true"></i>
  ```

- Never author inline icon SVG or icon paths. Use only supplied Lucide names; the sandbox replaces each placeholder with a host-sized `currentColor` SVG. Reserve authored inline SVG for charts and data marks.
- Mark decorative icons `aria-hidden="true"`. Put action icons inside labeled
  controls; use a visible label or `aria-label` for icon-only actions.
- Let the sandbox initialize static icons after the fragment without blocking
  first render. After adding icons dynamically, use
  `lucide.createIcons({ attrs: { width: 16, height: 16 } })`.
- Never load Lucide or another icon library from the network.
- Use visibly labeled buttons and inputs for small interactions. Keep all
  presentation-only interaction local to the fragment and make the first render
  useful before input changes.
- Use semantic controls, realistic spacing, and restrained chrome for mockups.
  Never fake product screenshots when inspectable UI is needed.
