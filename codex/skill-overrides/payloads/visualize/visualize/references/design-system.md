## Design system

- Let utilities own geometry, appearance, and interaction. Use the matching
  utility for every button and form control. Never restyle utilities,
  descendants, or pseudo-elements: no custom sizes, spacing, borders, radii,
  shadows, colors, or interaction states.

### Surfaces and layout

- `.card`: The only card-like HTML surface. Use its base class unchanged for a
  necessary numeric summary, selected-item summary, or bounded interactive
  field. Before adding a fill, border, radius, or shadow to any layout container,
  either use `.card` or leave it transparent and unframed; never recreate card
  chrome on rows, panels, tiles, sections, or wrappers. Keep charts, maps,
  diagrams, tables, controls, and the whole visualization unframed. Never nest
  cards; show 2-4 summaries near the top only when useful. Structural groupings
  and repeated content are not bounded interactive fields. Organize them with
  layout or visual marks, not container chrome.
- `.viz-stat`: Use a summary `.card` with one muted label, one
  `.viz-stat-value`, and at most one short context or delta line.
- `.viz-grid`: Use for peer metrics or choices instead of a custom grid. It
  creates as many equal-width columns as fit and stacks when narrow. Never use it
  for the whole visual or a horizontally scrolling card row. Keep groups to 2-3
  columns at 736px and controls in a separate row.
- `.viz-row`: Use as a wrapping horizontal group with centered related values or
  inline actions that may wrap when narrow.
- `<hr>`: Use a native horizontal rule for a subtle theme-aware separator.
- `.nav.nav-pills` + `.nav-link`: Use the accessible, interactive [Tabs](#tabs) API below.
- `.progress` + `.progress-bar`:
  `<div class="progress" role="progressbar" aria-label="Progress" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:25%"></div></div>`
- `.viz-tile`: Add to a selectable dense-grid `.btn`; it stretches to fill its
  grid cell, preserves category fill, and uses an accent ring instead of solid
  selection. Never add another selected, pressed, border, outline, or shadow
  rule.
- `.viz-badge`: Use as a compact display-only accent pill for a short status,
  category, or value; never as a button.
- `.viz-controls`: Use as a wrapping row for controls affecting the same
  visualization. Keep button groups compact. Put labeled fields directly inside
  as `.form-label`; fields form at most two columns and stack when narrow.

### Tabs

- `.nav.nav-pills[role="tablist"]`: Group content-width native `.nav-link[role="tab"]` buttons and label the group with `aria-label`. Add `.nav-justified` only when tabs should share and fill the row equally.
- `.nav-link[role="tab"]`: Give each button a unique `id`, `type="button"`, `aria-controls`, and `aria-selected`. Mark the initial tab `.active` and `aria-selected="true"`; use `disabled` or `aria-disabled="true"` when needed.
- `[role="tabpanel"]`: Match `id` to its tab's `aria-controls`, set `aria-labelledby` to the tab's `id`, and mark inactive panels `hidden`. Tabs can have separate panels or point to one shared panel.
- Tab behavior is already implemented by the JavaScript runtime and does not need to be wired.

```html
<div class="nav nav-pills" role="tablist" aria-label="Platform">
  <button class="nav-link active" id="mac" role="tab" aria-controls="mac-panel" aria-selected="true" type="button">macOS</button>
  <button class="nav-link" id="linux" role="tab" aria-controls="linux-panel" aria-selected="false" type="button">Linux</button>
</div>
<div id="mac-panel" role="tabpanel" aria-labelledby="mac">macOS content</div>
<div id="linux-panel" role="tabpanel" aria-labelledby="linux" hidden>Linux content</div>
```

### Controls

- `.btn`: Use for a content-sized secondary action. Add `.btn-primary` for one
  main action per control group or `.btn-ghost` for low emphasis.
- `.btn-block`: Add to a `.btn` only when the action should intentionally fill
  the available inline space. Never use it for ordinary row actions.
- `<a>`: Use for links. Add `.btn` to style a link as a button.
- `[data-tooltip]`: Use for concise supplementary plain text on static or dynamic
  triggers; the sandbox handles hover, focus, and touch and creates `.tooltip`
  elements. Keep essential content visible and triggers labeled. Never use
  `title`, custom markup, or initialization. Example:
  `<button type="button" data-tooltip="Reset view">Reset</button>`.
- `[data-tooltip-placement]`: Optionally prefer `top` (default), `right`,
  `bottom`, or `left`; collision handling may flip it.
- `.form-check`: Prefer a wrapping `<label class="form-check">` around the
  native `.form-check-input` and `.form-check-label` text so the whole row is
  tappable. An explicit label with matching `for` and input `id` also works.
- `.form-switch`: Add to `.form-check` around a native checkbox.
- `.form-control`: Pair a native text, date, file, or color input—or a
  textarea—with `.form-label`.
- `.form-control-color`: Add to `.form-control` for a compact native color
  input.
- `.form-select`: Pair a native select with `.form-label`.
- `.form-range`: Pair a native range with a visible label; put its current value
  and units immediately before it.

### Tables

- `.table`: Use on a semantic table for a quiet, unframed data view. It provides
  wrapping cells and subtle horizontal dividers without vertical gridlines. Use
  sentence case for headers.
- `.table-responsive`: Wrap a table when its columns cannot fit at narrow
  widths. It contains horizontal overflow without clipping the visualization.
- `.table-sm`: Add to `.table` when more rows need to fit; it reduces cell
  padding without shrinking text.
- `.text-end`, `.text-center`, and `.text-nowrap`: Use inside `.table` for
  numeric/end alignment, centered values, or values that must stay on one line.
  Numeric cells use tabular figures when end-aligned.

### Text

- `.text-small`: Use for the smallest host-scaled secondary chart labels and
  annotations, never below 11px or for essential content.
- `.text-muted`: Use for secondary units, captions, timestamps, and context,
  never essential values or labels.
- `.text-destructive`: Use only for error or validation text the user needs to
  notice or act on.
- `<code>`: Use for inline commands, file names, symbols, or short references;
  put multiline code in `<pre><code>`.
- `.sr-only`: Use for visually hidden accessible text.
