## MD3 Compliance Audit

When invoked with `audit` as the argument (e.g., `/material-3 audit`), or when asked to audit/review MD3 compliance, analyze the target app or page and produce a compliance report.

### Audit Procedure

1. **Identify the target**: The user provides a URL (use browser tools to inspect), file paths (read source), or a running app.
2. **Inspect the following categories** and score each 0–10:

| Category | What to check |
|----------|--------------|
| **Color tokens** | **Web:** `--md-sys-color-*` / generated CSS. **Compose:** `MaterialTheme.colorScheme` roles (no arbitrary `Color(...)` for surfaces without reason). Proper tonal pairing (`onX` on `X`). Dark theme. **Flutter:** `ColorScheme` roles. |
| **Typography** | MD3 type scale: **Compose** `MaterialTheme.typography`; **web** typescale tokens; correct roles (Display, Headline, Title, Body, Label). |
| **Shape** | **Compose** `MaterialTheme.shapes` / component `Shape`; **web** `var(--md-sys-shape-*)`. Buttons: full; cards: medium; avoid magic numbers. |
| **Elevation** | Tonal elevation (`Surface` tonal/shadow as appropriate). **Web:** hover/focus where relevant. |
| **Components** | **Compose:** Material3 composables (`Button`, `Scaffold`, etc.). **Web:** `@material/web` or spec-aligned HTML/CSS. Correct variants. |
| **Layout** | Canonical layouts; **Compose** window size class / adaptive APIs; readable max width on large widths; foldable hinge avoidance. |
| **Navigation** | Bar / rail / drawer / drawers+**Compose** `NavHost` patterns per size class; predictive back where applicable. |
| **Motion** | **Compose** `MotionScheme` / expressive APIs when used; transitions may still use easing/duration. **Web:** CSS motion tokens fallback. |
| **Accessibility** | MD3 roles help, but **verify contrast**: UI components often need **3:1** for large text/borders and **4.5:1** for normal text (WCAG 2.x). TalkBack/semantics (Compose), focus order, touch targets (~48dp). **Web:** ARIA, keyboard. |
| **Theming** | **Compose:** `MaterialTheme` + light/dark/dynamic as designed. **Web:** CSS custom properties on `:root` or subtree. **Flutter:** `ThemeData` + `ColorScheme`. |

3. **Generate the report**:

```
# MD3 Compliance Audit Report

Target: [URL or file path]
Date: [date]
Overall Score: [X/100]

## Scores by Category
| Category       | Score | Status |
|----------------|-------|--------|
| Color tokens   | X/10  | [pass/warn/fail] |
| Typography     | X/10  | [pass/warn/fail] |
| Shape          | X/10  | [pass/warn/fail] |
| Elevation      | X/10  | [pass/warn/fail] |
| Components     | X/10  | [pass/warn/fail] |
| Layout         | X/10  | [pass/warn/fail] |
| Navigation     | X/10  | [pass/warn/fail] |
| Motion         | X/10  | [pass/warn/fail] |
| Accessibility  | X/10  | [pass/warn/fail] |
| Theming        | X/10  | [pass/warn/fail] |

## Critical Issues
[List items scoring 0-3 with specific file:line references and fixes]

## Warnings
[List items scoring 4-6 with recommendations]

## Passing
[List items scoring 7-10 with notes on what's done well]

## Recommended Fixes (Priority Order)
1. [Most impactful fix first]
2. ...
```

### Audit Methods

**For a live URL** (browser or devtools):
- Inspect computed styles and CSS variables (`--md-sys-*`)
- Resize viewport or use responsive mode for breakpoints
- Capture screenshots at key widths if helpful

**For source code** (file paths provided):
- **Compose/Kotlin:** `.kt` files — `MaterialTheme`, composables, `Color(0x…)` abuse, hard-coded `Dp`, missing `Modifier.semantics` where needed
- **Flutter:** `.dart` — `ThemeData`, `ColorScheme`
- **Web:** HTML/JSX/Vue/Svelte; CSS/SCSS for tokens
- Check **web** imports for `@material/web` vs `@material/mdc-*` (MD2)

**Quick checks** (adapt paths to your stack):
```
# Web: hardcoded colors
grep -rn '#[0-9a-fA-F]\{3,8\}' --include='*.css' --include='*.scss'

# Compose: raw Color(...) audits (sample — tune for your codebase)
grep -rn 'Color(0x' --include='*.kt'

# MD2 on web
grep -rn '@material/mdc-' --include='*.js' --include='*.ts'
```

**Browser automation** (if your environment exposes MCP browser tools): navigate, snapshot DOM/CSS variables, resize for breakpoints — optional, not required.

### Scoring Guide

- **9-10**: Fully MD3 compliant, uses correct tokens and patterns
- **7-8**: Mostly compliant, minor issues (e.g., a few hardcoded values)
- **4-6**: Partially compliant, some MD3 patterns but significant gaps
- **1-3**: Major violations, mostly non-MD3 or MD2 patterns
- **0**: Not applicable or completely absent

Status thresholds: **pass** (7+), **warn** (4-6), **fail** (0-3)
