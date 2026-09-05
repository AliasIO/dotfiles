---
name: figma-implement-motion
description: Translates Figma motion and animations into production-ready application code. Use when implementing animation/motion from a Figma design — user mentions "implement this motion", "add animation from Figma", "animate this component", provides a Figma URL whose node is animated, or when `get_design_context` returns motion data or instructs you to call `get_motion_context`.
disable-model-invocation: false
---

# Implement Motion

## Overview

This skill guides translation of Figma animations and transitions into runnable code (motion.dev, CSS keyframes, or framework-specific libraries).

Figma exposes motion through two tools:

- `get_motion_context` — authoritative motion tool. Returns the complete animated-node inventory, precomputed code snippets (CSS `@keyframes` + motion.dev), fallback keyframe bindings when snippets are unavailable, and recursive timeline coordination hints (`timelineCohorts`). **Source of truth for animation data and which node IDs animate.**
- `get_design_context` — the design's **structure**: layout, sizing, assets, styling, Code Connect hints, screenshot context, and sometimes **motion placement markers** on animated elements (`data-node-id`, and on split nodes `data-motion-keys` / `data-motion-wrapper-for` / `data-motion-transform-template`). It may render an animated node as a plain element (`div`, `p`, `span`, etc.) or a motion element (`motion.div`); it does not inline the animation values.

**The two are linked by node id, and that's the whole workflow.** `get_motion_context` tells you which nodes animate and gives the keyframe values, easing, timing, and snippets. `get_design_context` tells you what those nodes look like and where they sit. For every node in `get_motion_context.nodes`, find the matching `data-node-id` in design context and merge the motion into that structure — adding or wrapping a `motion.{tag}` when the structural element is plain. When design context has reused a Figma component, the motion node may also include `fallbackNodeId`; use it only as a fallback after trying the exact `nodeId`.

## Skill Boundaries

- Use this skill when the deliverable is motion code in the user's repository.
- If the user asks to create/edit animations inside Figma itself, switch to [figma-use](../figma-use/SKILL.md) and follow that skill instead.
- This skill currently covers **animations** as emitted by `get_motion_context` (snippets plus fallback keyframe tracks, including preset-authored motion resolved into those forms). Broader interactive variant flows may still need product-specific state handling in code.

## Prerequisites

- Figma MCP server connected and accessible.
- Node ID parsed from the Figma URL the user provides. URL format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2` — extract `fileKey` (the segment after `/design/`) and `nodeId` (the value of the `node-id` query parameter, e.g. `42-15`).
- Target codebase. Motion output format adapts to stack (see [Framework Recommendations](#framework-recommendations)).

## Tool Choice

For motion implementation, use both tools with distinct roles:

| Situation | Tool | Why |
|---|---|---|
| Understanding static structure, assets, styles, Code Connect, or visual layout | `get_design_context` | Gives the component/page code reference and asset URLs you need to place animated nodes correctly. |
| Fetching animation data for any node | `get_motion_context` | Purpose-built for motion and the source of truth for timing, easing, snippets, and keyframes. |
| A node has motion markers (`data-motion-keys`, `data-motion-wrapper-for`) | Markers for split *placement*, `get_motion_context` for *values* | Split markers tell you which tracks go on which element; the keyframes/easing/timing and animated-node inventory come from `get_motion_context`. |

`get_motion_context` accepts `recursive: true` (capped at 500 nodes) when you need descendants' motion in one call.

## Implementation workflow

Read [the motion workflow](references/motion-implementation-workflow.md) when implementing motion. Match animated node IDs to static design context, use authoritative snippets when present, and use track data only as the documented fallback.

## Critical Rules

These are the general principles. Specific gotchas (rotation pivots, HOLD semantics, color interpolation, etc.) live in the categorized [references](#references). When a linked reference is mentioned in this skill text and the situation applies, load that file before continuing.

1. **Respect the tool's output's *values*, not its layout.** Preserve the exact timing, easing, keyframe values, and `transformOrigin` from `codeSnippets` — don't regenerate them from `keyframeBindings` or the structured fields when snippets exist (regenerating loses fidelity on custom bezier easings, spring approximations, and overshoot values). `transformOrigin` is **per element**: apply each scaling/rotating node's own — including nested scalers, not just the outer wrapper — or the element pivots from the default center and grows/spins from the wrong corner (see the per-element-`transformOrigin` example). But the snippet is one node's data, not a copy-paste template: when many nodes share it, factor it per Rule 7 instead of pasting the block N times.
2. **Match the user's existing motion stack.** Read the component's imports and any sibling animations before adding dependencies. If the user already has Framer Motion, React Spring, anime.js, GSAP — adapt the output to their stack rather than forcing motion.dev.
3. **Honor `prefers-reduced-motion`.** Any motion added must soften or disable under `@media (prefers-reduced-motion: reduce)` — typically skip the `animate` (render the initial/resting state) or cut the duration to near-zero. This is an accessibility default, not an opt-in.
4. **Validate one animation end-to-end before batching.** Build, reload, and watch one full timeline loop — confirm each animated node appears at the time its keyframe track says it should. "Renders without error" is not "renders correctly." Motion failures compound when you batch — a wrong easing on one node is easy to spot; the same bug across twenty nodes is hours of untangling.
5. **Don't fabricate motion.** If a node has no motion data in the response, leave it static. Do not borrow easing/duration defaults from elsewhere in the design, and do not auto-animate "because the rest of the component is animated."
6. **Don't download an asset just to `Read` it.** `get_design_context` / `get_motion_context` return assets as URLs (`/api/mcp/asset/...`), often SVG. Reference the URL directly where the consumer fetches it (an `<img src>`, CSS `background-image`, an asset import), or `curl` one to inline its contents (e.g. inline the SVG and render via `NSImage(data:)` on SwiftUI). The important exception is path-level SVG motion: if the motion snippet targets a path inside an SVG asset, inline the SVG and animate the real path instead of leaving it behind an `<img>`. Don't download an asset and feed the file to the `Read` tool: SVG isn't a Read-able image format, so the read is rejected and wasted — and a file tool that doesn't detect SVG-as-image can stall the loop on it.
7. **Factor out repeated motion — never copy-paste the snippet per element.** Many nodes usually share the *same* animation differing only by a stagger delay, offset, or target value. Implement the shared motion **once** — a reusable animated component or a `variants` object parameterized by the values that vary — render from a mapped array (`items.map(...)`), and pull repeated literals (durations, easing arrays, offsets) into named constants. The animation's *values* stay verbatim from the snippet (Rule 1); the *code* stays DRY. The same transition object pasted 15+ times (800 lines that should be 150) is a low-quality result — fidelity and maintainability are both graded.

## Framework Recommendations

Rule 2 covers the general posture: prefer the user's existing stack. When none exists, defaults:

- **React**: [motion.dev](https://motion.dev) (the `motion` package). The tool returns motion.dev code directly — use it.
- **Vanilla / non-React web**: CSS `@keyframes` with `animation` shorthand, returned directly by the tool.
- **SwiftUI**: Native `.animation(...)` modifiers, translated from the **CSS** snippet (`get_motion_context` emits no SwiftUI code, but SwiftUI/iOS clients still get the CSS format; fall back to `keyframeBindings` / `motionSummary` / cohort only when snippet-less). **Use only real SwiftUI APIs** — no modifier takes a Figma/CSS easing directly, so load [references/framework-recommendations.md](references/framework-recommendations.md#swiftui-translation), map the easing to its SwiftUI equivalent, and verify rather than invent. This path is evolving; confirm with the user if unsure.

**For established effect classes, prefer a library over hand-rolled CSS.** Effects like glass/glassmorphism, confetti, particle systems, physics-based interactions, and scroll-linked motion have battle-tested library implementations that handle cross-browser quirks, accessibility, and performance far better than generated keyframes. Load [references/framework-recommendations.md](references/framework-recommendations.md) for the full library-by-effect-class table. Surface these as recommendations, not mandates — the user decides.

## Examples

Load [references/examples-and-anti-examples.md](references/examples-and-anti-examples.md) when you need worked examples or failure patterns. It covers the simple merge flow, plain text elements that need `motion.*` added, interleaved static+animated transforms, SVG path-level motion, and anti-examples for DOM rebuilding, node-id/position drift, and missing per-element `transformOrigin`.

## References

Six deep dives, fetched on demand. General frontend concerns (performance, units, accessibility mechanics) are handled by the critical rules above — these references focus on Figma-specific signal only. If this skill names one of these files in an inline instruction, load that file before continuing with that part of the task.

- [references/examples-and-anti-examples.md](references/examples-and-anti-examples.md) — worked examples and failure patterns. Load when applying the merge workflow, handling interleaved transforms, or checking whether a generated implementation has rebuilt the DOM, swapped node positions, or dropped `transformOrigin`.
- [references/gotchas.md](references/gotchas.md) — Figma-specific motion bugs and their fixes. Rotation/scale origin on nested groups, HOLD easing semantics, CUSTOM_SPRING preservation, independent axis scaling ambiguity, color interpolation. Load when troubleshooting unexpected runtime behavior. **Always load [references/motion-lint-rules.md](references/motion-lint-rules.md) alongside this file** — gotcha entries reference specific lint rules that must be surfaced to the user.
- [references/svg-and-path-motion.md](references/svg-and-path-motion.md) — implementing motion that targets an SVG vector path (inline the asset, `motion.path`, `pathLength="1"`, wrapper+path layering, CSS path-trim). Load when a vector's snippet targets the path, not a wrapper transform.
- [references/framework-recommendations.md](references/framework-recommendations.md) — motion.dev, CSS keyframes, SwiftUI defaults, library-by-effect-class table (glass, confetti, particles, physics, scroll-linked). Load before hand-rolling an effect.
- [references/unsupported-and-fallbacks.md](references/unsupported-and-fallbacks.md) — Figma motion features that don't export cleanly today (text animations, path animations, masks/booleans, variants/transitions). Includes video/lottie fallback guidance. Load when the tool response seems incomplete. **Always load [references/motion-lint-rules.md](references/motion-lint-rules.md) alongside this file** — unsupported entries reference specific lint rules that must be surfaced to the user.
- [references/motion-lint-rules.md](references/motion-lint-rules.md) — Linting rules: known export limitations (errors and warnings) that must be surfaced to the user. Load when generating motion code to check whether any active limitations apply.
