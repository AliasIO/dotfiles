---
name: material-3
description: >
  Implement Google's Material Design 3 (Material You) UI system. Primary: Jetpack Compose
  Material3 (MaterialTheme, components, adaptive layout). Also Flutter and limited web
  (@material/web, maintenance mode). Covers tokens, 30+ components, layout, theming,
  M3 Expressive (platform matrix), and accessibility. Use when: "material design", "MD3",
  "material you", "Jetpack Compose", "MaterialTheme", "material component", "md3 button".
user-invokable: true
argument-hint: "[component|theme|layout|scaffold|audit] [description or URL]"
---

# Material Design 3

This skill guides implementation of Google's Material Design 3 (MD3) — a personal, adaptive, expressive design system. MD3 uses dynamic color, tonal surfaces, rounded shapes, and spring-based motion to create UIs that feel alive and personal.

## Philosophy

MD3 is built on three principles:
- **Personal**: Dynamic color adapts UI to the user's wallpaper or content. Theming is individual, not one-size-fits-all.
- **Adaptive**: Layouts transform across 5 window size classes. Components resize, reposition, and change form factor responsively.
- **Expressive**: Shape morphing, spring physics, and emphasized typography create moments of delight without sacrificing usability.

## Current Updates: Google I/O 2026

Material's [Google I/O 2026 update](https://m3.material.io/blog/whats-new-at-io26) reinforces a **Compose-first** Android path and expands expressive/adaptive guidance:

- **Material Android is Compose-first**: For new Android work, prefer Jetpack Compose Material3 for the latest components, expressive APIs, adaptive scaffolds, and Styles API integration. Android Views may remain necessary in existing apps, but they should not be treated as the default path for new Material 3 implementations.
- **Expressive layout system**: Use an expressive layout scaffold to adapt screens across mobile, desktop, foldables, watches, XR, and other spatial form factors. Start from adaptive scaffolds/window size classes instead of fixed phone-first layouts.
- **8dp spacing system**: Apply spacing tokens for margins, padding, and gaps so layouts and components can adapt programmatically to device type and density.
- **New/updated expressive components**: Lists, menus, search, and search app bars have refreshed expressive guidance, with Jetpack Compose as the primary implementation target.
- **Watches and XR**: Watches emphasize physics-based motion, arc text, and edge-hugging containers. XR emphasizes spatial panels and depth-based elevation.

**Key differences from MD2:**
- Tonal surfaces replace elevation shadows as the primary depth cue
- Dynamic color generates full schemes from a single seed color
- Fully rounded corners by default (not slightly rounded)
- Spring-based motion physics replace fixed easing curves for components
- 3 levels of user-controlled contrast (standard/medium/high)

Preserve the user’s design direction and existing design system. If a separate design skill is available and relevant, use it as optional guidance; this skill does not require it. Distinguish platform compatibility requirements from aesthetic defaults.

## Decision Tree

**What are you building?**
```
Full app scaffold        → See references/app-patterns.md + references/layout-and-responsive.md
Single component         → See references/tokens-and-components.md → references/component-catalog.md
Custom theme             → See references/theming-and-dynamic-color.md
Form / input layout      → See references/component-catalog.md § Input Components
Navigation structure     → See references/navigation-patterns.md
Data display             → See references/component-catalog.md § Data Display
```

**What platform?**
```
Jetpack Compose          → Primary: androidx.compose.material3, MaterialTheme, references/*
Flutter                  → useMaterial3: true in ThemeData, ColorScheme.fromSeed()
Web (vanilla JS)         → @material/web (limited; maintenance mode) + CSS custom properties
Web (React/Vue/Svelte)   → CSS custom properties + wrapper components (no official React lib)
Web (CSS-only)           → MD3 token values as CSS custom properties (no <md-*> elements)
```

## Tokens and components

For theme/token or component selection work, read [tokens and components](references/tokens-and-components.md).

## Jetpack Compose (primary)

Use **`androidx.compose.material3`** with `MaterialTheme` and Material 3 composables (`Scaffold`, `Button`, `NavigationBar`, top app bars, etc.).

- **Theming**: `MaterialTheme(colorScheme = …, typography = …, shapes = …)`. Prefer `dynamicLightColorScheme` / `dynamicDarkColorScheme` on **Android 12+ (API 31+)** when dynamic color is desired; otherwise `lightColorScheme` / `darkColorScheme` or generated theme code from Material Theme Builder.
- **Adaptive UI**: Window size classes, list-detail and supporting-pane layouts, foldables — see `references/layout-and-responsive.md` and `references/navigation-patterns.md`.
- **Edge-to-edge & insets**: Lay out content with `WindowInsets` / scaffold padding so bars and IME behave correctly — see `references/layout-and-responsive.md`.
- **Experimental APIs**: Some Material 3 APIs require `@OptIn(ExperimentalMaterial3Api::class)` or expressive opt-ins; match your BOM and compiler.

```kotlin
MaterialTheme(
    colorScheme = colorScheme, // from dynamicLightColorScheme / lightColorScheme / etc.
    typography = Typography(),
    shapes = Shapes(),
) {
    // M3 content — prefer references for Scaffold, navigation, text fields
}
```

## Web implementation

For an explicitly selected web implementation, read [web guidance](references/web-implementation.md). Do not use Android-only APIs in a web project.

## App patterns

Read [app patterns](references/app-patterns.md) for a new app shell or a matching layout pattern; reuse the existing project structure for local changes.

## Anti-Patterns

**Never do these when implementing MD3:**

- **Mix MD2 and MD3 libraries**: Don't use `@material/mdc-*` (MD2) alongside `@material/web` (MD3). They have incompatible APIs and styling.
- **Hardcode colors**: Always use `var(--md-sys-color-*)` tokens, never raw hex/rgb values. Hardcoded colors break dynamic theming, dark mode, and contrast adjustment.
- **Ignore tonal pairing**: Only combine colors in their intended pairs (e.g., `primary` + `on-primary`, `surface-container` + `on-surface`). Arbitrary pairings break contrast in dynamic color and high contrast modes.
- **Use `outline` for dividers**: Use `outline-variant` for dividers. `outline` is for important boundaries like text field borders.
- **Import all of @material/web**: Always import individual component modules. Barrel imports include every component and destroy bundle size.
- **Use `border-radius` directly**: Use shape tokens (`var(--md-sys-shape-corner-medium)`) so shapes stay consistent with theming.
- **Use shadows for elevation by default**: MD3 communicates elevation through tonal surface color, not shadows. Only add shadows when elements need extra separation from busy backgrounds.
- **Apply frontend-design "avoid Roboto" rule**: On **Android**, **Roboto** is the default Material typeface; **web** often uses Roboto or Roboto Flex with MD3 tokens. Replace only when intentionally customizing the type scale.
- **Assume SSR compatibility**: `@material/web` uses Web Components (custom elements) which require JavaScript to render. They won't produce meaningful HTML in SSR without additional hydration strategies.
- **Ignore foldables and large screens**: MD3 is designed for all screen sizes. Don't ship phone-only layouts — use canonical layouts, multi-pane at 600dp+, and test on foldable/tablet emulators. Place no interactive content across the fold/hinge.
- **Stretch content to fill wide screens**: On Large (1200dp+) and Extra-large (1600dp+) windows, constrain content to a max width (840–1040dp). Endless-width text lines are unreadable.

## Platform Notes

### Flutter
```dart
MaterialApp(
  theme: ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
  ),
);
```

### Jetpack Compose
See **[Jetpack Compose (primary)](#jetpack-compose-primary)** above. Use `LocalContext.current` with `dynamicLightColorScheme` / `dynamicDarkColorScheme` only when `Build.VERSION.SDK_INT >= Build.VERSION_CODES.S` and dynamic color is enabled; otherwise supply static light/dark schemes.

### Component Name Mapping
| Concept | Web | Flutter | Compose |
|---------|-----|---------|---------|
| Filled button | `md-filled-button` | `FilledButton` | `Button` |
| Outlined text field | `md-outlined-text-field` | `OutlinedTextField` | `OutlinedTextField` |
| FAB | `md-fab` | `FloatingActionButton` | `FloatingActionButton` |
| Navigation bar | `md-navigation-bar` | `NavigationBar` | `NavigationBar` |
| Switch | `md-switch` | `Switch` | `Switch` |

## M3 Expressive (May 2025)

The Expressive update adds visual richness while maintaining usability. **Availability differs by platform** — do not assume one stack implements everything.

| Capability | Jetpack Compose | Flutter | Web (`@material/web`) |
|------------|-----------------|---------|------------------------|
| Expressive layout scaffold / adaptive layout | Compose-first via Material3 adaptive APIs and window size classes | Use Flutter adaptive/layout primitives | CSS/container queries/manual layout; no Material Web parity |
| 8dp spacing system | Use design tokens / `Dp` spacing constants; keep margins, padding, and gaps adaptive | Use theme spacing constants | CSS custom properties / design tokens |
| Expressive lists, menus, search, search app bar | Primary target per current Material guidance; check BOM and opt-ins | Check current Flutter Material docs | Spec-aligned custom implementation; `@material/web` is maintenance-only |
| Spring / motion physics | Supported in Material 3 (see `MotionScheme`, expressive APIs per BOM) | Varies by Flutter Material version | **Not** in Material Web; use easing/duration or custom motion |
| Emphasized typography | Via theme / type scale | Via theme | Token/CSS only; no full Expressive component set |
| Shape morphing | Compose-first in Google’s expressive rollout | Check current Flutter docs | **Not** in `@material/web` |
| New button sizes (XS–XL), toggle | Follow Compose Material3 components | Follow Flutter MD3 | Height/CSS approximations only |
| Extra corner tokens (e.g. large-increased) | `MaterialTheme.shapes` / tokens | Theme shapes | CSS `--md-sys-shape-*` |
| 3 contrast levels | Scheme builders / system | Plugins / manual | `SchemeContent` contrast parameter in JS utilities |
| Watches / XR form factors | Use Compose/Wear/XR-specific guidance where available | Platform-specific | Web/spatial UI custom implementation |

**Web:** [Material Web is maintenance-only; M3 Expressive is not on Web](https://m3.material.io/develop/web). Use CSS easing/duration tokens as fallback for motion, not spring parity.

**Legacy easing/duration** remains valid for **transitions** (enter/exit/shared-axis) where the spec still references them; see the Motion table below.

## Design-system audit

Use [the audit guide](references/compliance-audit.md) for requested compliance reviews or a substantial redesign. Do not run a full scoring exercise for every component edit.

## Reference Documents

- `references/color-system.md` — Color roles, tonal palettes, dynamic color, Compose + CSS mapping
- `references/typography-and-shape.md` — Type scale, shape corners, elevation, motion, Expressive notes
- `references/component-catalog.md` — Components: Compose + `@material/web` where applicable
- `references/navigation-patterns.md` — Navigation selection, Compose-first adaptive patterns
- `references/layout-and-responsive.md` — Breakpoints, canonical layouts, insets, foldables
- `references/theming-and-dynamic-color.md` — Theming: Compose first, then Flutter and web
