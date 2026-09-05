---
name: figma-code-connect
description: "Create or update parserless .figma.ts Code Connect templates for published Figma components. For an existing parser-based React .figma.tsx project, preserve that integration and use its matching official workflow instead."
disable-model-invocation: false
---

# Code Connect

## Overview

Create Code Connect template files (`.figma.ts`) that map Figma components to code snippets. Given a Figma URL, follow the steps below to create a template.

> **You write `.figma.ts` template files ONLY — never `.figma.tsx`.** This skill produces *parserless templates*: a `.figma.ts` file whose default export uses a `` figma.code`...` `` tagged template. Do **NOT** write a `.figma.tsx` file and do **NOT** use `figma.connect()` — that is the separate **parser-based** Code Connect format (published a different way) and is the **wrong artifact** for this skill; output written as `.figma.tsx` is rejected outright. If a `.figma.tsx` already exists for a component, leave it untouched and add your `.figma.ts` template alongside it. A capable model may be tempted to reach for the more familiar `.figma.tsx` / `figma.connect()` pattern from memory — resist it; here the correct output is **always** `.figma.ts` + `figma.code`.

## Prerequisites

- **Figma MCP server must be connected** — verify that Figma MCP tools (e.g., `get_code_connect_suggestions`) are available before proceeding. If not, guide the user to enable the Figma MCP server and restart their MCP client.
- **Components must be published** — Code Connect only works with components published to a Figma team library. If a component is not published, inform the user and stop.
- **Organization or Enterprise plan required** — Code Connect is not available on Free or Professional plans.
- **URL must include `node-id`** — the Figma URL must contain the `node-id` query parameter.
- **TypeScript types** — for editor autocomplete and type checking in `.figma.ts` files `@figma/code-connect/figma-types` must be added to `types` in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "types": ["@figma/code-connect/figma-types"]
    }
  }
  ```

## Step 1: Parse the Figma URL

Extract `fileKey` and `nodeId` from the URL:

| URL Format | fileKey | nodeId |
|---|---|---|
| `figma.com/design/:fileKey/:name?node-id=X-Y` | `:fileKey` | `X-Y` → `X:Y` |
| `figma.com/file/:fileKey/:name?node-id=X-Y` | `:fileKey` | `X-Y` → `X:Y` |
| `figma.com/design/:fileKey/branch/:branchKey/:name` | use `:branchKey` | from `node-id` param |

Always convert `nodeId` hyphens to colons: `1234-5678` → `1234:5678`.

**Worked example:**

Given: `https://www.figma.com/design/QiEF6w564ggoW8ftcLvdcu/MyDesignSystem?node-id=4185-3778`
- `fileKey` = `QiEF6w564ggoW8ftcLvdcu`
- `nodeId` = `4185-3778` → `4185:3778`

## Step 2: Discover Unmapped Components

The user may provide a URL pointing to a frame, instance, or variant — not necessarily a component set or standalone component. Call the MCP tool `get_code_connect_suggestions` with:
- `fileKey` — from Step 1
- `nodeId` — from Step 1 (colons format)
- `excludeMappingPrompt` — `true` (returns a lightweight list of unmapped components)

This tool identifies published components in the selection that don't yet have Code Connect mappings.

**Handle the response:**

- **"No published components found in this selection"** — the node contains no published components. Inform the user they need to publish the component to a team library in Figma first, then stop.
- **"All component instances in this selection are already connected to code via Code Connect"** — everything is already mapped. Inform the user and stop.
- **Normal response with component list** — extract the `mainComponentNodeId` for each returned component. Use these resolved node IDs (not the original from the URL) for all subsequent steps. If multiple components are returned (e.g. the user selected a frame containing several different component instances), repeat Steps 3–6 for each one.

## Step 3: Fetch Component Properties

Call the MCP tool `get_context_for_code_connect` with:
- `fileKey` — from Step 1
- `nodeId` — the resolved `mainComponentNodeId` from Step 2
- `clientFrameworks` — determine from `figma.config.json` `parser` field (e.g. `"react"` → `["react"]`)
- `clientLanguages` — infer from project file extensions (e.g. TypeScript project → `["typescript"]`, JavaScript → `["javascript"]`)

For multiple components, call the tool once per node ID.

The response contains the Figma component's **property definitions** — note each property's name and type:
- **TEXT** — text content (labels, titles, placeholders)
- **BOOLEAN** — toggles (show/hide icon, disabled state)
- **VARIANT** — enum options (size, variant, state)
- **INSTANCE_SWAP** — swappable nested instances tied to a specific component (icon, avatar)
- **SLOT** — flexible content regions (freeform layout, mixed children); use `getSlot()` in templates (not the same as INSTANCE_SWAP)

Save this property list — you will use it in Step 5 to write the template.

## Step 4: Identify the Code Component

If the user did not specify which code component to connect:

1. Check `figma.config.json` for `paths` and `importPaths` to find where components live
2. Search the codebase for a component matching the Figma component name. Check common directories (`src/components/`, `components/`, `lib/ui/`, `app/components/`) if `figma.config.json` doesn't specify paths
3. Read candidate files and compare their props interface against the Figma properties from Step 3 — look for matching variant types, size options, boolean flags, and slot props
4. If multiple candidates match, pick the one with the closest prop-interface match and explain your reasoning to the user
5. If no match is found, show the 2 closest candidates and ask the user to confirm or provide the correct path

**Confirm with the user** before proceeding to Step 5. Present the match: which code component you found, where it lives, and why it matches (prop correspondence, naming, purpose).

Read `figma.config.json` for import path aliases — the `importPaths` section maps glob patterns to import specifiers, and the `paths` section maps those specifiers to directories.

Read the code component's source to understand its props interface — this informs how to map Figma properties to code props in Step 5.

## Step 5: Create the parserless template

Read [template authoring](references/parserless-template-authoring.md) before writing a new parserless template. Preserve existing parser-based React projects instead of silently migrating them.

## Step 6: Validate

Read back the `.figma.ts` file and review it against the following:

- **Correct file type & format (check this FIRST)** — the file is `ComponentName.figma.ts` (NOT `.figma.tsx`), and its default export is a parserless template using a `` figma.code`...` `` tagged template. It must NOT use `figma.connect()` (the parser-based format). If you wrote `.figma.tsx` or `figma.connect()`, discard it and rewrite as a `.figma.ts` `figma.code` template.
- **Property coverage** — every Figma property from Step 3 should be accounted for in the template. Flag any that are missing and ask the user if they were intentionally omitted.
- **Valid, correctly typed code** — all emitted code must be valid and correctly typed against the code component's `Props` interface. Never make up component properties — if a Figma property has no corresponding code prop, omit it rather than invent one.
- **No hardcoded children** — verify that every INSTANCE_SWAP property and child component slot uses the dynamic APIs (`getInstanceSwap()`, `findInstance()`, `findConnectedInstance()`, etc.) with `executeTemplate()`. No slot should contain hardcoded component content.
- **Rules and Pitfalls** — check for the common mistakes listed below (string concatenation of template results, unnecessary `hasCodeConnect()` guards, missing `type === 'INSTANCE'` checks, etc.)
- **Interpolation wrapping** — strings (`getString`, `getEnum`, `textContent`) wrapped in quotes, instance/section values (`executeTemplate().example`) wrapped in braces, slot sections (`getSlot`) interpolated as snippet sections inside `` figma.code`...` ``, booleans using conditionals

If anything looks uncertain, consult [api.md](references/api.md) for API details and [advanced-patterns.md](references/advanced-patterns.md) for complex nesting.

## API details

Use [the quick reference](references/parserless-quick-reference.md) for the bindings or template features needed by the change.

## Rules and Pitfalls

1. **Never string-concatenate template results.** `executeTemplate().example` is a `ResultSection[]` object, not a string. Using `+` or `.join()` produces `[object Object]`. Always interpolate inside tagged templates: `` figma.code`${snippet1}${snippet2}` ``

2. **Do not use `hasCodeConnect()` guards.** Call `executeTemplate()` directly on any instance after a `type === 'INSTANCE'` check. The runtime handles instances without Code Connect automatically.

   ```ts
   // WRONG — hasCodeConnect() gate drops non-CC instances
   if (icon && icon.type === 'INSTANCE' && icon.hasCodeConnect()) {
     iconCode = icon.executeTemplate().example
   }

   // CORRECT — let the runtime handle all instances
   if (icon && icon.type === 'INSTANCE') {
     iconCode = icon.executeTemplate().example
   }
   ```

3. **Check `type === 'INSTANCE'` before calling `executeTemplate()`.** `findInstance()`, `findConnectedInstance()`, and `findText()` return an `ErrorHandle` (truthy, but not a real node) on failure — not `null`. Always add a type check to avoid crashes: `if (child && child.type === 'INSTANCE') { ... }`

4. **Prefer `getInstanceSwap()` over `findInstance()`** when a component property exists for the slot. `findInstance('Star Icon')` breaks when the icon is swapped to a different name; `getInstanceSwap('Icon')` always works regardless of which instance is in the slot.

5. **Use `getSlot()` only when the Figma property type is `SLOT`.** For **INSTANCE_SWAP** props, use `getInstanceSwap()` (returns an `InstanceHandle`). `getSlot()` returns structured slot sections, not instances — never call `executeTemplate()` on its return value.

6. **Property names are case-sensitive** and must exactly match what `get_context_for_code_connect` returns.

7. **Handle multiple template arrays correctly.** When iterating over children, set each result in a separate variable and interpolate them individually — do not use `.map().join()`:
   ```ts
   // Wrong:
   items.map(n => n.executeTemplate().example).join('\n')

   // Correct — use separate variables:
   const child1 = items[0]?.executeTemplate().example
   const child2 = items[1]?.executeTemplate().example
   export default { example: figma.code`${child1}${child2}` }
   ```

7. **Never hardcode slot or children content.** Always resolve child instances dynamically — use `getInstanceSwap()` for INSTANCE_SWAP properties, `findInstance()`/`findConnectedInstance()` for direct children — and render them via `executeTemplate()`. Never construct JSX from a layer name (e.g., `<StarIcon />`) or guess import paths. If an instance has no Code Connect, omit it — do not add a hardcoded fallback.

   ```ts
   // WRONG — hardcodes the icon from its layer name
   example: figma.code`<Button icon={<StarIcon />}>Submit</Button>`

   // CORRECT — resolves dynamically, works for any swapped icon
   const icon = instance.findInstance('Icon')
   let iconCode
   if (icon && icon.type === 'INSTANCE') {
     iconCode = icon.executeTemplate().example
   }
   example: figma.code`<Button${iconCode ? figma.code` icon={${iconCode}}` : ''}>...</Button>`
   ```

8. **Attempt to represent every Figma property via a code prop.** The code component's `Props` interface (from Step 4) is the authoritative list of attribute names. For each Figma property, figure out the right way to represent it using the API methods from Step 5 — direct name match, value transformation, or whatever fits. If no code prop fits at all, omit it — don't invent a prop name.

## Worked example

Use [the complete example](references/parserless-example.md) only when a matching example would clarify implementation.

## Additional Reference

For advanced patterns (multi-level nested components, `findConnectedInstances` filtering, metadata prop passing between parent/child templates):

- [api.md](references/api.md) — Full Code Connect API reference
- [advanced-patterns.md](references/advanced-patterns.md) — Advanced nesting, metadata props, and descendant patterns
