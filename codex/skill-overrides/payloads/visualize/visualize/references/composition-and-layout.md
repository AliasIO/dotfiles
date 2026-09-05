## Composition

Choose the smallest composition that fits.

- Prefer interaction detail over permanent panels, toolbars, repeated legends,
  or long stacks. Add only requested controls, use one mechanism per state, and
  never invent search, filter, or reset controls.
- Keep filters, selections, and other presentation-only interactions local. For
  drill-down actions that ask Codex to investigate or explain selected data,
  call `await window.openai.sendFollowUpMessage({ prompt, title })`, where the
  optional `title` is a concise confirmation-dialog heading of up to 250
  characters. Include the selected values and requested investigation in the
  prompt, and label the action clearly.
- Show only metrics that explain the requested behavior. Put live values in
  control headers or on the visual before cards. Treat maxima as ceilings, not
  targets. Never invent qualitative scores, status cards, or secondary fact
  grids to fill space.

### UI mockups

- Include a few thoughtfully chosen design alternatives whenever they would help the user explore a mockup, without waiting for the user to ask. Read [tweak.md](../tweak.md) and bind useful options with the host-provided `Tweak` helper. Keep ordinary mockup interactions local; do not add design controls to charts, explainers, or simulations unless requested. Do not render a second controls panel or open annotation mode automatically.
- "In the widget" means the in-conversation visualization, not a widget inside
  the depicted product.
- Use product and platform context already available in the conversation;
  don't search the project to render a mockup. Match the product's chrome,
  navigation, typography, colors, and content. If its design is unavailable,
  infer one from the platform and request.
- NEVER use visualization CSS variables or utility classes inside a mockup
  (for example, `--card`, `--font-size-base`, `.card`, or `.btn`). Define
  root-scoped, product-specific colors, typography, surfaces, and controls
  instead. This rule overrides all general visualization guidance.
- Keep only the surrounding conversation surface transparent. Give product
  windows, cards, menus, and popovers opaque backgrounds, and stack overlays
  above the product content.
- Follow the host's active appearance with product-specific
  `light-dark(<light>, <dark>)` colors unless a fixed theme is requested.
- **Contained mockup:** Frame a component, dialog, small feature, or mobile
  screen as a compact product surface.
- **Full-page mockup:** Render a desktop window, application shell, or page at
  full width without an additional visualization card.
- Put app-wide navigation and pickers in the app chrome, and local controls in
  their component. Omit single-option pickers. Show realistic states, not
  invented dashboards, filler cards, or oversized icons.

### Interactive explainer or simulation

- Use compact controls or status, one compact dominant visual, and at most one
  single-line selected-state detail. Default to no summary cards; allow up to
  three only when changing metrics are central.
- Crop empty space and fit the available inline width. For
  step-throughs, add only requested step controls and update one current visual;
  never add parameter controls, formulas, metric cards, or side-by-side steps
  unless asked.

### Graphs and plots

- Use D3 for data-rich Cartesian or statistical plots and handwritten SVG for
  simple, directly labeled values. Keep diagrams, simulations, and maps under
  their existing guidance. Load the version-pinned approved-CDN script
  `https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js`.
- Render the figure, legend, and subplots directly on the transparent host
  surface. Frame only the SVG plot area; never wrap charts in `.card`, rounded
  panels, filled backgrounds, or shadowed containers.
- Give the figure a concise visible title. Render each Cartesian subplot in
  its own responsive SVG with a matching `viewBox`, a thin frame, and visible
  `text.axis-title[data-axis="x"]` and `text.axis-title[data-axis="y"]`
  showing quantities and units.
- Set each SVG `viewBox` from its own container's measured width, redraw with
  `ResizeObserver`, and reserve at least 64px for the y axis. Never scale down
  a fixed-width `viewBox`.
- Derive padded domains with `d3.extent(...)` over all observations,
  uncertainty, and references. Inset scale ranges for marker radii and keep
  every path inside `rect[data-chart-frame]`; never draw endpoint connectors
  outside the frame or guess or hard-code the domain.
- After every draw, measure tick, axis, and value-label bounds together.
  Leave 4px between labels, anchor edge labels inward, and remove optional
  annotations first. At 360px, show at most four x ticks and stack panels.
- Prefer `--viz-series-1` through `--viz-series-6` for chart series; use
  `--foreground` and `--border` for neutrals, cycle the six series tokens when
  more are needed, and never use literal or fallback colors. Give every SVG
  label `fill: var(--foreground)` and `font-size: 12px`; never shrink labels
  below 11 screen pixels. Stack subplots when their labels no longer fit.
- Keep observations, trends, and important values visible. Use bands for dense
  uncertainty, whiskers for isolated estimates, and one compact, wrapping
  legend. Render one real `<button type="button" aria-pressed="true">` per
  series with a small swatch and neutral text; toggle its line, markers, and
  tooltip row together. Keep buttons transparent, borderless, and
  indistinguishable from inline text; never use `.btn`, pills, badges,
  rounded borders, or filled and selected backgrounds.
- Share one root-relative, pointer-transparent
  `<div class="tooltip" role="tooltip">` using `--popover` and
  `--popover-foreground`. In each multi-series SVG, give the full-plot overlay
  both `data-chart-hit` and `data-chart-hover-overlay="cross-series"`. Keep
  the `data-chart-hover-guide` at the exact cursor x, interpolate every
  visible series there, and show one aligned `data-chart-hover-marker` and
  tooltip row per visible series; never snap the guide to a nearby sample. Let
  touch users pin the same cross-series details without requiring hover.
- Find ordered observations with `d3.bisector(d => d.x).center(values, x)`;
  never pass an accessor to `d3.bisectCenter`.
- Give isolated marks transparent `data-chart-hit` targets at least 32 screen
  pixels across on fine pointers and about 44px on coarse pointers; use one
  nearest-point overlay for dense scatter.
- Verify actual marks, tooltip behavior, and light and dark themes at 736px
  and 360px before responding; verify wide layouts at 1,024px as well.
- For named numeric data and one-off analyses, start with the plot. Put values
  and takeaways on its marks, axes, or annotations. Never add a KPI row,
  controls, cards, or panels unless those UI elements are explicitly requested.
- For sequences or parallel work, use aligned lanes on one time axis. Encode
  phase and resource in the marks; annotate totals, waits, and bottlenecks on
  the axis or lanes, not above the plot.
- For distributions or multi-metric comparisons, use shared-scale facets or
  small multiples. Render every requested dimension simultaneously; never hide
  one behind a toggle.

### Maps

- Let the map dominate the composition. Use at most one compact
  selection/detail area and only requested controls.
- Always project published GeoJSON/TopoJSON and sourced longitude/latitude with
  `d3-geo`; never hard-code or hand-draw geographic outlines. Use schematic maps
  only when asked.
- For world countries, import
  `https://esm.sh/@d3-maps/atlas@1.0.0/world/countries/countries-110m` and convert
  it with `topojson-client@3.1.0` using
  `feature(world, world.objects.features).features`. Join input ISO3 directly to
  `feature.properties.id`, which is already ISO3; do not convert it to numbers.
- For US states or counties, use
  `https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json/+esm`. For ZIP/ZCTA
  or city boundaries, download official Census or local open-data GeoJSON; do
  not guess sibling atlas paths or import raw JSON as JavaScript.
- Keep maps geographically legible: for local points, fetch published
  neighborhood, street, or comparable geometry; a blank field or lone
  administrative outline is not a basemap. Show the full city or region behind
  points or partial choropleths, and frame the locations with modest padding.
- Include the verified geometry in the final HTML. Open it before replying and
  fix blank basemaps, failed imports, missing labels, or unprojected points.

### Dense categorical grid

- Use one compact horizontal selected-item summary, then a grid with exactly one
  readable identifier per cell, then one small legend. Render only that
  identifier as visible cell text; put all other metadata in an accessible label
  or one summary line, not badges or fact grids. Allow only selection unless
  asked.

### Part-to-whole or time allocation

- Use compact metrics and one stacked chart of category allocation per period.
  Never substitute totals-only bars or duplicate it as a heatmap and totals
  chart.

## Layout and accessibility

- Use semantic HTML, keyboard-accessible controls, and concise labels.
- Use `aria-live="polite"` for dynamic results, selections, and simulator
  updates. Use `role="alert"` for validation errors. Do not announce every
  hover or animation frame.
- Keep the top-level surface transparent and unframed, and fill the available
  conversation width. Design for 736px, or 1,024px in wide mode, and support
  widths down to 320px. Stack side-by-side content when it no longer fits.
- At every supported width, text, controls, cards, toolbars, and dynamic content
  must fit without overlap or clipping. Reflow by stacking or wrapping; use
  `.table-responsive` only when table columns cannot fit. The host sizes the
  frame to its content, so avoid fixed outer widths, other horizontal overflow,
  internal scrolling, `position: fixed`, and viewport-height layouts.
- Size every SVG from its actual container. At narrow widths, reduce ticks,
  declutter annotations, and keep visible text at least 11 screen pixels;
  never shrink a fixed-width `viewBox`.
- Keep native tab order; never add `tabindex`.
- Use native `button`, `input`, `select`, and `textarea` elements with matching
  utilities; never recreate controls.
- Keep browser or utility focus styles; never override them.
- On coarse pointers, provide non-overlapping effective targets about 44px by
  44px without breaking 320px layouts; visible icons and marks may stay small.
  Keep fine-pointer controls compact, and let shared utilities own touch sizing
  and at least 16px editable-field text.
- Keep essential content and actions available without hover.
