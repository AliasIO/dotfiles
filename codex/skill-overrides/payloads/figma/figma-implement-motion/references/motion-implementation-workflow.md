## Required Workflow

### Step 1: Confirm static design context is available

```
get_design_context(fileKey=":fileKey", nodeId="<node-id>")
```

If `get_design_context` has already been called for this node, reuse that output. If not, call it normally now.

Use it as the **structure of record** — hierarchy, sizing, styling, assets, Code Connect hints, screenshot context, and any motion placement markers it happens to include (Step 3). The animated-node inventory and animation values come from `get_motion_context` (Step 2).

### Step 2: Fetch authoritative motion data

```
get_motion_context(fileKey=":fileKey", nodeId="<node-id>", recursive=true)
```

Response shape (one entry per animated node):

- `codeSnippets` — pre-generated CSS `@keyframes` and motion.dev strings. **Use these directly.** Do not regenerate them from fallback track data.
- `keyframeBindings` — bound keyframe tracks, including preset-derived motion resolved into track data, included only as fallback data when both snippet formats are missing.
- `motionSummary` — one-line-per-field natural-language description of the animation. Present **only when there's no snippet** (keyframe-bindings-only motion codegen couldn't express as CSS/motion.dev). Build from it when present; ignore it whenever a snippet exists.
- `fallbackNodeId` — optional fallback id for matching componentized design context. If `nodeId` is an instance-qualified id such as `I4005:6111;30:8005`, D2R may render the reusable component body with the backing component id instead, such as `4002:3957`. In that case, `fallbackNodeId` is the `data-node-id` to look for if exact `nodeId` lookup fails.

Recursive responses also include `timelineCohorts` — a **top-level** array (not per-node) of nodes sharing one timeline: `{ rootNodeId, durationMs, loopMode: 'once' | 'loop' | 'boomerang', memberNodeIds[] }`. For coordinated multi-node motion, drive all `memberNodeIds` from one shared lifecycle using `durationMs` (÷1000 for seconds) and `loopMode` — don't infer timing from sibling order.

Implementation details that matter for LLMs:

- When a snippet exists, `motionSummary`, `timelineDurationMs`, and `transformOrigin` may be omitted to shrink the payload — the snippet already carries duration + transform-origin (motion.dev `duration` / `style={{ transformOrigin }}`, or CSS `animation` / `transform-origin`) and the cohort carries `durationMs`. A missing field never means "no animation."
- Recursive responses dedupe exact duplicate snippets. A snippet may be replaced with a comment pointing to the first node with identical motion; reuse the same component, variant, class, or constants instead of writing a second animation.
- The MCP server infers CSS vs motion.dev snippets from `clientFrameworks`; if the response only contains one snippet format, adapt that format to the user's stack rather than assuming the other format failed.

### Step 3: Merge static and motion context

- Start from `get_motion_context.nodes`, not from visible `motion.*` tags in the static JSX. **Every returned node is animated.** Match each motion node back to `get_design_context` by exact `nodeId` / `data-node-id` first. If and only if there is no exact match, try `fallbackNodeId` / `data-node-id`. Fall back to node name/type and screenshot position only after both ids fail.
- **Exact id match wins over `fallbackNodeId`.** `fallbackNodeId` points at the backing component id that D2R may emit inside a reusable component. It is shared by every instance of that component. If the exact `nodeId` exists in design context, apply motion there and ignore the fallback. This is critical for root-instance animation: one instance can rotate or move differently from another instance of the same component, and applying that motion to the shared component body would animate all instances incorrectly.
- **Apply each motion node to the matching design-context structure, keyed by `data-node-id`.** The matching `data-node-id` is the structural anchor, not always the final DOM element that receives motion. Use the snippet shape and placement markers to decide whether motion goes on that exact element, a wrapper, an inner element, or an inlined SVG path. `get_design_context` may already emit `motion.{tag}` with values stripped, or it may emit a plain structural element (`div`, `p`, `span`, component root, etc.). If it is plain and the snippet targets the element itself, convert it to the appropriate `motion.{tag}` or add a motion wrapper while preserving the node's text, children, classes/styles, attributes, and `data-node-id`. Load [references/examples-and-anti-examples.md](../references/examples-and-anti-examples.md) to see examples of this merging step.
- **Componentized child motion usually matches by fallback.** When design context extracts a Figma instance into a reusable React component, children inside that component body often have backing component ids (`4002:3957`) while motion context reports live instance ids (`I4005:6111;30:8005`). In this case, use `fallbackNodeId` to find the component-body `data-node-id`, but keep the motion scoped to the rendered instance you are implementing. If there are multiple instances and only one has different root motion, exact id matching keeps that per-instance motion separate.
- Split nodes carry a `data-motion-keys` / `data-motion-wrapper-for` marker — see _Handling interleaved transforms_ below.
- **Preserve `display: contents` wrappers — unless the group itself animates.** Layout-transparent group wrappers come through as `contents` (Tailwind `contents`), usually alongside a dead `absolute`/`inset-[…]` (those do nothing on a `contents` box). For a _static_ group, keep `display: contents` and let the children position against the nearest real ancestor — converting the wrapper's `inset` into a positioned box reparents the children to a smaller box, so they render too small / shifted inward. For an _animated_ group (the group node itself has motion), `display: contents` can't carry a transform — replace it with a real positioned wrapper and apply the group motion there. Load [references/gotchas.md](../references/gotchas.md) before implementing this case.
- **`get_motion_context` is the complete animated-node inventory.** Some animated nodes render as plain (non-`motion`) elements — component instance roots (plain positioning `<div>`), text (`<p>`), masks — that still carry a `data-node-id`. Walk every node in the motion response and apply its motion to the element with the matching `data-node-id`, wrapping or converting as needed. If an animated node has no element at all in the output (e.g. an animated mask flattened into a static `mask-image`), don't drop it silently — leave a `// TODO: <nodeId> motion unsupported` comment and call it out in your summary.
- If a node appears in motion context but not in the static JSX, add the element needed to represent it — design-context code is a reference, not a complete animation inventory.
- On conflict between design and motion context (timing/easing/animated values), prefer `get_motion_context`.
- **Path-level SVG motion: inline the SVG and animate the real `<path>`.** When `get_motion_context` targets a vector's path (`PATH_TRIM`, `motion.path`, `stroke-dasharray`) but design context renders it as an `<img>`, inline the SVG and apply the snippet to the `<path>`, keeping the layout wrapper. Load [references/svg-and-path-motion.md](../references/svg-and-path-motion.md) for the full how-to for this case (motion.path, `pathLength="1"`, wrapper+path layering, CSS path-trim).

#### Handling interleaved transforms

A node with **both** a static base transform and animated transforms is split across nested elements so the two compose correctly instead of fighting: an id-less `motion.div` carrying `data-motion-wrapper-for="<nodeId>"` (the OUTER wrapper) wraps a static-transform div (e.g. `rotate-45` + `hypot()` sizing — or the wrapper itself carries `data-motion-transform-template="<css>"`) which wraps the INNER node (`data-node-id`). Keep the `wrapper > static-transform div > inner` nesting — collapsing it breaks sizing and the base transform.

- **Place tracks by `data-motion-keys`.** The wrapper's `data-motion-keys` (transform tracks — `x`/`y`/`rotate`/`scaleX`/`scaleY`/`skewX`) go on the OUTER wrapper; the inner element's `data-motion-keys` go on the INNER element.
- **Re-apply a `data-motion-transform-template`.** If the wrapper carries one, set `transformTemplate={(_, generated) => "<css> " + generated}` so the animated transform composes on top of that static layout transform.
- **Offset the animated transform by the static base (avoid double rotation).** `get_motion_context` gives the node's _absolute_ transform, which already includes whatever static base those divs apply. A `rotate` snippet of `[45, 125, 125]` over a `rotate-45` base means the wrapper animates the **offset** `[0, 80, 80]` (= absolute − 45), not the absolute — else the 45° applies twice and the element sits at 90° at rest. Tracks with no static base (e.g. `x`/`y` starting at 0) pass through unchanged. See the interleaved-transform example.
- **Keep layout transforms separate from Motion transforms.** For every `motion.*` element that animates `rotate`, `scale`, or `skew`, verify it does not also rely on Tailwind layout transforms such as `-translate-x-1/2` or `-translate-y-1/2` for centering/positioning. Those utilities share the CSS `transform` property that Motion.dev writes inline, so Motion's transform can erase the layout translate. If both are needed, split the element into a static layout wrapper carrying the centering/positioning transform and an inner `motion.*` element carrying animated rotate/scale/opacity, or encode the layout offset in Motion itself (`x: "-50%"`) and keep it present for every keyframe.

### Step 4: Apply the motion in code

- **motion.dev present in snippets?** Use the motion.dev code verbatim for React targets. Import from `motion/react` — unless the codebase already uses another motion library (Framer Motion, React Spring, GSAP), in which case adapt the snippet to it. Load [references/framework-recommendations.md](../references/framework-recommendations.md) when adapting to another stack or choosing a library.
- **CSS keyframes present?** Use for vanilla/non-React targets, or when the codebase has no React motion library.
- **No snippets (keyframe-bindings-only)?** Build equivalent motion.dev/CSS from `keyframeBindings` + `motionSummary`, taking loop timing from the cohort's `durationMs` / `loopMode` and reading `transformOrigin` / duration from the structured fields. Rare — snippets are normally present, including for SwiftUI/iOS (which get the CSS format).

### Step 5: Validate

- Read the component's existing motion imports/conventions before adding new ones. If the user already uses Framer Motion / React Spring / anime.js, adapt rather than forcing motion.dev.
- Spot-check one animation runs end-to-end (reload, observe, iterate) before batching changes across many nodes.
- Load [references/gotchas.md](../references/gotchas.md), which covers specific bugs and edge cases seen in Figma motion output, and correct any such cases in the generated code.
