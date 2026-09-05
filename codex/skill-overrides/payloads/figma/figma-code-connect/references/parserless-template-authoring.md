## Step 5: Create the Template File (.figma.ts)

### File location

Place the file alongside existing Code Connect files. Check `figma.config.json` `include` patterns for the correct directory. **Name it `ComponentName.figma.ts` — never `ComponentName.figma.tsx`.** The `.figma.tsx` extension is the parser-based format; do not create one or modify an existing one.

### Template structure

Every template file follows this structure:

```ts
// url=https://www.figma.com/file/{fileKey}/{fileName}?node-id={nodeId}
// source={path to code component from Step 4}
// component={code component name from Step 4}
import figma from 'figma'
const instance = figma.selectedInstance

// Extract properties from the Figma component (see property mapping below)
// ...

export default {
  example: figma.code`<Component ... />`,       // Required: code snippet
  imports: ['import { Component } from "..."'], // Optional: import statements
  id: 'component-name',                         // Required: unique identifier
  metadata: {                                    // Optional
    nestable: true,                              // true = inline in parent, false = show as pill
    props: {}                                    // data accessible to parent templates
  }
}
```

### Property mapping

Use the property list from Step 3 to extract values. For each Figma property type, use the corresponding method:

| Figma Property Type | Template Method | When to Use |
|---|---|---|
| TEXT | `instance.getString('Name')` | Labels, titles, placeholder text |
| BOOLEAN | `instance.getBoolean('Name', { true: ..., false: ... })` | Toggle visibility, conditional props |
| VARIANT | `instance.getEnum('Name', { 'FigmaVal': 'codeVal' })` | Size, variant, state enums |
| INSTANCE_SWAP | `instance.getInstanceSwap('Name')` | Swapped instance for a fixed component slot (then `hasCodeConnect()` / `executeTemplate()`) - do not confuse with the SLOT property below |
| SLOT | `instance.getSlot('Name')` | Freeform slot content only when the Figma property type is **SLOT**
| (child layer) | `instance.findInstance('LayerName')` | Named child instances without a property |
| (text layer) | `instance.findText('LayerName')` → `.textContent` | Text content from named layers |

**TEXT** — get the string value directly:
```ts
const label = instance.getString('Label')
```

**VARIANT** — map Figma enum values to code values:
```ts
const variant = instance.getEnum('Variant', {
  'Primary': 'primary',
  'Secondary': 'secondary',
})

const size = instance.getEnum('Size', {
  'Small': 'sm',
  'Medium': 'md',
  'Large': 'lg',
})
```

**BOOLEAN** — simple boolean or mapped to values:
```ts
// Simple boolean
const disabled = instance.getBoolean('Disabled')

// Mapped to code values (e.g. when the code prop is an enum, not a boolean)
const size = instance.getBoolean('Show Label', { true: 'large', false: 'small' })
```

**Map Figma properties to code props where there's a valid correspondence.** Figma properties and code props don't always line up 1:1 — some Figma properties map directly (by name, or via the API methods above), others have no code equivalent. Where a mapping exists, use it; where none fits, omit the Figma property rather than invent a code prop. Never emit an attribute whose name doesn't appear in the code component's `Props` interface.

### Exhaustive variant handling

When a VARIANT property has multiple possible values, the `getEnum` mapping **must list every value** returned by `get_context_for_code_connect`. Don't omit values — an unmapped value silently returns `undefined`, producing broken output.

```ts
// WRONG — omits 'Warning', which will render as undefined
const status = instance.getEnum('Status', {
  'Success': 'success',
  'Error': 'error',
})

// CORRECT — every value is mapped
const status = instance.getEnum('Status', {
  'Success': 'success',
  'Error': 'error',
  'Warning': 'warning',
  'Info': 'info',
})
```

When **two or more VARIANT properties combine** to produce different code output, generate exhaustive conditional branches. For example, 2 variants × 2 values = 4 branches:

```ts
const type = instance.getEnum('Type', { 'Filled': 'filled', 'Outlined': 'outlined' })
const status = instance.getEnum('Status', { 'Success': 'success', 'Error': 'error' })

let colorClass
if (type === 'filled' && status === 'success') {
  colorClass = 'bg-green-500 text-white'
} else if (type === 'filled' && status === 'error') {
  colorClass = 'bg-red-500 text-white'
} else if (type === 'outlined' && status === 'success') {
  colorClass = 'bg-transparent border-green-500'
} else if (type === 'outlined' && status === 'error') {
  colorClass = 'bg-transparent border-red-500'
}
```

If the combinations produce **repetitive** output (e.g., `Size` doesn't change the snippet structure — it's just passed through as a prop), a single `getEnum` mapping per variant is sufficient — no need for cross-product branches.

**INSTANCE_SWAP** — access swappable component instances:
```ts
const icon = instance.getInstanceSwap('Icon')
let iconCode
if (icon && icon.type === 'INSTANCE') {
  iconCode = icon.executeTemplate().example
}
```

**SLOT** — `getSlot(propName)` is only valid when the Figma component property reported in Step 3 has type **`SLOT`**. Do not use `getSlot()` for **INSTANCE_SWAP** properties (those use `getInstanceSwap()`). Slots are explicit “content regions” in the component definition, not generic nested instances.

- **Signature:** `getSlot(propName: string): ResultSection[] | undefined`
```ts
// Figma property "Content" must be type SLOT in component properties
const content = instance.getSlot('Content')

export default {
  example: figma.code`<Card>${content}</Card>`,
  // ...
}
```

### Interpolation in tagged templates

When interpolating values in tagged templates, use the correct wrapping:
- **String values** (`getString`, `getEnum`, `textContent`): wrap in quotes → `variant="${variant}"`
- **Instance/section values** (`executeTemplate().example`): wrap in braces → `icon={${iconCode}}`
- **Slot sections** (`getSlot()` result — `ResultSection[] | undefined`): interpolate directly inside `` figma.code`...` `` (same shape as nested snippet sections), e.g. `` figma.code`<Select>${content}</Select>` `` — do not treat as a plain string
- **Boolean bare props**: use conditional → `${disabled ? 'disabled' : ''}`

### Finding descendant layers

When you need to access children that aren't exposed as component properties:

| Method | Use when |
|---|---|
| `instance.getInstanceSwap('PropName')` | Figma property type is **INSTANCE_SWAP** (fixed swapped instance) |
| `instance.getSlot('PropName')` | Figma property type is **SLOT** (freeform content region) |
| `instance.findInstance('LayerName')` | You know the child layer name (no component property) |
| `instance.findText('LayerName')` → `.textContent` | You need text content from a named text layer |
| `instance.findConnectedInstance('id')` | You know the child's Code Connect `id` |
| `instance.findConnectedInstances(fn)` | You need multiple connected children matching a filter |
| `instance.findLayers(fn)` | You need any layers (text + instances) matching a filter |

### Nested configurable instances

A component may contain child instances that are **not exposed as component properties** (no INSTANCE_SWAP) but are still **independently configurable** — they have their own variants, properties, or swap slots. These must be resolved dynamically, not hardcoded.

1. **Check whether the child already has a Code Connect template** — use `get_code_connect_suggestions` or check existing `.figma.ts` files in the project.
2. **If no template exists, create one** for the child so it renders correctly both standalone and when nested.
3. **Reference the child from the parent** using `findInstance()` or `findConnectedInstance()`, then call `executeTemplate()`.

```ts
// Parent template — the Badge child isn't a prop, but it's configurable
const badge = instance.findInstance('Status Badge')
let badgeCode
if (badge && badge.type === 'INSTANCE') {
  badgeCode = badge.executeTemplate().example
}

export default {
  example: figma.code`<Card>${badgeCode}</Card>`,
  // ...
}
```

This applies to icons, badges, labels, and any other nested instance that is configurable by itself — always connect them and render dynamically, never hardcode their content.

### Nested component example

For multi-level nested components or metadata prop passing between templates, see [advanced-patterns.md](../references/advanced-patterns.md).

```ts
const icon = instance.getInstanceSwap('Icon')
let iconSnippet
if (icon && icon.type === 'INSTANCE') {
  iconSnippet = icon.executeTemplate().example
}

export default {
  example: figma.code`<Button ${iconSnippet ? figma.code`icon={${iconSnippet}}` : ''}>${label}</Button>`,
  // ...
}
```

### Conditional props

```ts
const variant = instance.getEnum('Variant', { 'Primary': 'primary', 'Secondary': 'secondary' })
const disabled = instance.getBoolean('Disabled')

export default {
  example: figma.code`
    <Button
      variant="${variant}"
      ${disabled ? 'disabled' : ''}
    >
      ${label}
    </Button>
  `,
  // ...
}
```
