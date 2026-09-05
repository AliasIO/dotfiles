## Inline Quick Reference

### `instance.*` Methods

| Method | Signature | Returns |
|---|---|---|
| `getString` | `(propName: string)` | `string` |
| `getBoolean` | `(propName: string, mapping?: { true: any, false: any })` | `boolean \| any` |
| `getEnum` | `(propName: string, mapping: { [figmaVal]: codeVal })` | `any` |
| `getInstanceSwap` | `(propName: string)` | `InstanceHandle \| null` |
| `getSlot` | `(propName: string)` | `ResultSection[] \| undefined` |
| `getPropertyValue` | `(propName: string)` | `string \| boolean` |
| `findInstance` | `(layerName: string, opts?: SelectorOptions)` | `InstanceHandle \| ErrorHandle` |
| `findText` | `(layerName: string, opts?: SelectorOptions)` | `TextHandle \| ErrorHandle` |
| `findConnectedInstance` | `(codeConnectId: string, opts?: SelectorOptions)` | `InstanceHandle \| ErrorHandle` |
| `findConnectedInstances` | `(selector: (node) => boolean, opts?: SelectorOptions)` | `InstanceHandle[]` |
| `findLayers` | `(selector: (node) => boolean, opts?: SelectorOptions)` | `(InstanceHandle \| TextHandle)[]` |

### InstanceHandle Methods

| Method | Returns |
|---|---|
| `hasCodeConnect()` | `boolean` |
| `executeTemplate()` | `{ example: ResultSection[], metadata: Metadata }` |
| `codeConnectId()` | `string \| null` |

### TextHandle Properties

| Property | Type |
|---|---|
| `.textContent` | `string` |
| `.name` | `string` |

### SelectorOptions

```ts
{ path?: string[], traverseInstances?: boolean }
```

- `traverseInstances: true` — required when the target lives inside another nested instance. Without it, `findInstance`/`findText` only search the current instance's own layers and stop at nested instance boundaries.
- `path: string[]` — disambiguates when multiple descendants share the same layer name. Lists parent layer names that must appear on the path to the target.

**Examples:**

```ts
// Layer hierarchy:
//   A > C (instance) > "mychild"
// "mychild" sits inside nested instance C, so plain findInstance returns ErrorHandle.
instance.findInstance('mychild', { traverseInstances: true })

// Layer hierarchy:
//   A > C (instance) > "mychild"
//   A > D (instance) > "mychild"
// Two "mychild" layers exist — use path to pick the one under C.
instance.findInstance('mychild', { traverseInstances: true, path: ['C'] })
```

**When to reach into a nested instance from a parent template:** only when the parent code component (from Step 4) takes the nested layer as a prop value itself (e.g. `<C show={<B />} />` — A forwards B into C). If the parent just composes C and C renders B internally, resolve C with `executeTemplate()` and let C's own template handle B — don't duplicate B's rendering at the parent level.

### Export Structure

```ts
export default {
  example: figma.code`...`,                      // Required: ResultSection[]
  id: 'component-name',                         // Required: string
  imports: ['import { X } from "..."'],          // Optional: string[]
  metadata: { nestable: true, props: {} }        // Optional
}
```
