# Components And Forms Notes

These notes summarize durable guidance from the official Vuetify 2 docs. Re-open the official page for the specific component before using an unfamiliar prop or slot.

## Forms

- Use `v-form` as the validation boundary for grouped inputs.
- Prefer the built-in `rules` flow before inventing custom validation plumbing.
- Rules are evaluated sequentially and display at most one error at a time, so order them intentionally.
- `v-form` exposes the documented imperative methods through `ref`:
  `validate()`, `reset()`, and `resetValidation()`.

## Text Fields

- Prefer the documented input variants instead of custom wrappers:
  default, `filled`, `outlined`, `solo`, `shaped`, `dense`, `single-line`.
- Prefer built-in affordances:
  `clearable`, `counter`, `hint`, `persistent-hint`, `prefix`, `suffix`, `append-icon`, `append-outer-icon`, `prepend-icon`, `progress`, `error-messages`.
- `counter` is informational only; it does not validate on its own.
- `hide-details="auto"` is the documented way to suppress bottom details when there is nothing to show.
- Use icon events such as `click:append`, `click:append-outer`, `click:prepend`, and `click:clear` instead of DOM listeners on internal markup.
- Use slots when you need documented label or icon customization instead of hand-built wrappers.

## Selects

- Use `v-select` for list-backed selection; keep the options in `items`.
- When `items` are objects, align `item-text` and `item-value` with real object keys.
- Use `return-object` when the consumer should receive the selected object instead of a scalar value.
- Use `menu-props` for menu positioning and behavior instead of patching the generated menu after render.
- Use documented patterns for multi-select presentation:
  `multiple`, `chips`, and the `selection` slot.
- Use prepended or appended item slots for actions like select-all instead of custom markup outside the component.

## Buttons

- Prefer `v-btn` variants over custom classes:
  default raised, `text`, `outlined`, `plain`, `rounded`, `tile`, `block`, `icon`, `depressed`, `loading`.
- Use `loading` for in-flight actions instead of swapping custom spinners into the button body.
- When you need white text on a button, prefer `white--text` over misusing the `dark` prop.
- Use icon buttons for icon-first actions instead of raw `v-icon` click targets.

## Cards

- Use the card subcomponents instead of ad hoc spacing wrappers:
  `v-card-title`, `v-card-subtitle`, `v-card-text`, `v-card-actions`.
- `v-card-actions` is the documented place for card-level buttons and aligns them correctly.
- Use built-in states such as `loading` and `outlined` before reaching for custom styles.
- Use `v-expand-transition` with documented reveal patterns when a card needs expandable content.

## Lists

- Use `v-list` and `v-list-item*` primitives for structured navigation and repeated text rows.
- Lists support single-line, two-line, and three-line variants; use the documented props instead of hand-tuned heights.
- Use `dense`, `flat`, `rounded`, `shaped`, and `nav` when those variants match the intended role.
- Use `v-list-group` for collapsible nested navigation.
- Use `v-list-item-group` when list selection state matters.
- Inside navigation drawers, pair `v-navigation-drawer` with a `v-list nav` pattern.

## Dialogs

- Use the documented activator slot whenever possible.
- Use `persistent` only when dismissing the dialog outside the surface or via `Esc` would break the flow.
- Prefer `scrollable` and `fullscreen` props over custom overflow or viewport logic.
- If an activator slot is not available, the docs call out the need for `.stop` on the event that opens the dialog.
- On small screens, consider the breakpoint-driven `fullscreen` pattern instead of forcing desktop dialog proportions onto mobile.

## Menus

- Use the activator slot for normal menu flows.
- For menus without an activator, use the documented `absolute` plus `position-x` and `position-y` path.
- Use `attach` when detached menu content needs correct tab and focus behavior.
- Use `open-on-hover` only when hover interaction is truly appropriate for the surface.
- For nested activators such as tooltip plus menu, follow the documented `v-slot` activator composition rather than mixing raw listeners.

## Navigation Drawers

- Use `v-navigation-drawer` for app-level navigation, usually as a direct child of `v-app`.
- The documented responsive default is `v-model = null`, which initializes closed on mobile and open on desktop.
- Pair drawers with `v-list nav` for drawer contents.
- Use `mini-variant.sync` when the content area needs to respond to mini state.
- `expand-on-hover` does not resize `v-main` on its own.
- Use `bottom` for mobile-only bottom drawer behavior when the pattern fits.
- In RTL contexts, explicitly define `right` when the drawer belongs on the right side.

## App Bars

- Use `v-app-bar` for primary application navigation and page-level action chrome.
- Use `v-app-bar-nav-icon` for drawer toggles instead of ad hoc icon-button combinations.
- Use `v-app-bar-title` when the app bar title needs the documented scroll/shrink behavior.
- Avoid wrapping `v-btn icon` controls in extra containers inside app bars unless you also account for Vuetify’s documented spacing behavior.
- Use documented scroll props such as `collapse-on-scroll`, `hide-on-scroll`, `elevate-on-scroll`, `fade-img-on-scroll`, and `scroll-threshold` before writing custom scroll listeners.

## Icons

- Use `v-icon` with the configured icon strategy. In this repo that means `mdiSvg`.
- Use the documented icon naming and packaging path instead of inlining SVG markup in templates when `v-icon` can express it.
- Treat icon accessibility explicitly:
  decorative icons should be hidden from assistive tech, semantic icons need text alternatives or appropriate attributes such as `role="img"` and `aria-label`.
- Use icon buttons for clickable icon actions; plain clickable icons are only appropriate when the surrounding component docs support that interaction.

## Data Tables

- Prefer built-in `v-data-table` behavior before replacing header or body rendering.
- Use documented table props for common needs:
  `search`, `custom-filter`, `filterable`, `footer-props`, `group-by`, `group-desc`, `loading`, `loading-text`, `show-select`, `single-select`, `show-expand`, `expanded.sync`, `item-key`, `multi-sort`, `options.sync`, `server-items-length`.
- When customizing individual columns, prefer `header.<name>` and `item.<name>` slots instead of taking over the entire table.
- If you fully replace `header`, `body`, or `item`, you also take over the built-in selection and expansion behavior.
- Use `v-simple-checkbox` inside table slots because it matches Vuetify’s internal alignment and semantics better than `v-checkbox`.
- If scoped-slot modifiers trigger eslint errors, the docs note that `vue/valid-v-slot` may need `allowModifiers: true`.
