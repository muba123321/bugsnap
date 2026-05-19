# BugSnap Design Polish — Spec

**Date:** 2026-05-18
**Scope:** All screens — main app, ApiKeySetup, OnboardingModal

---

## Problem

Text across the app is unreadable at small sizes. Labels and helper text use colors as dark as `#333` on near-black backgrounds, and font sizes as small as `10px`. The overall aesthetic is good but needs professional polish.

---

## Decision

**Direction:** Deep Navy — shift pure blacks to deep navy-blues, lift muted text to readable contrast, tighten typography scale.

**Implementation:** Shared JS token object (`src/theme.js`) — single source of truth for all design values. Components import tokens instead of hardcoding strings. No architecture change required; fully compatible with the existing inline-style approach.

---

## Token File

**`src/theme.js`**

```js
export const colors = {
  bg:            '#080a10',
  surface:       '#0f1219',
  surfaceHigh:   '#0a0d15',
  border:        '#1d2535',
  borderStrong:  '#253045',
  accent:        '#ff2d2d',
  textPrimary:   '#f0eee8',
  textSecondary: '#b8b6b0',
  textMuted:     '#5a6a8a',
}

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
}

export const fontSize = {
  xs:   '11px',
  sm:   '12px',
  md:   '13px',
  base: '14px',
}
```

---

## Component Changes

### `src/App.jsx`

| Element | Before | After |
|---|---|---|
| Page background | `#0b0c0f` | `colors.bg` |
| Header gradient | `#0b0c0f → #111318` | `colors.bg → colors.surface` |
| Header border | `#1e2028` | `colors.border` |
| How-strip background | `#0e1013` | `colors.surfaceHigh` |
| How-strip step label | `11px #ff2d2d` | `fontSize.xs colors.accent` |
| How-strip step desc | `11px #444` | `fontSize.sm colors.textMuted` |
| `?` button background | `#1e2028` | `colors.surface` |
| `?` button border | `#2a2d38` | `colors.borderStrong` |
| `?` button color | `#888` | `colors.textMuted` |
| "Update API key" | `#333` | `colors.textMuted` |

### `src/components/ApiKeySetup.jsx`

| Element | Before | After |
|---|---|---|
| Description text | `13px #555` | `fontSize.md colors.textMuted` |
| Input background | `#111318` | `colors.surface` |
| Input border (default) | `#1e2028` | `colors.border` |
| Button (disabled) | `#2a2d38` | `colors.border` |
| Helper link | `11px #333` | `fontSize.sm colors.textMuted` |

### `src/components/BugInput.jsx`

| Element | Before | After |
|---|---|---|
| Label | `11px #555` | `fontSize.sm colors.textMuted` |
| Textarea background | `#111318` | `colors.surface` |
| Textarea border | `#1e2028` | `colors.border` |
| Textarea text | `#e8e6e0` | `colors.textSecondary` |

### `src/components/ReportCard.jsx`

| Element | Before | After |
|---|---|---|
| Card background | `#111318` | `colors.surface` |
| Card border | `#1e2028` | `colors.border` |
| Header background | `#0e1013` | `colors.surfaceHigh` |
| Section labels | `10px #ff2d2d` | `fontSize.xs colors.accent` |
| Env card background | `#0b0c0f` | `colors.bg` |
| Env card border | `#1e2028` | `colors.border` |
| Env key label | `10px #444` | `fontSize.xs colors.textMuted` |
| Env value | `13px #aaa` | `fontSize.md colors.textSecondary` |
| Step number bg | `#1e2028` | `colors.border` |
| Step number color | `#ff2d2d` | `colors.accent` |
| Step text | `13px #aaa` | `fontSize.md colors.textSecondary` |
| Expected/Actual bg | `#0b0c0f` | `colors.bg` |
| Expected/Actual text | `13px #aaa` | `fontSize.md colors.textSecondary` |
| Tag background | `#1a1c22` | `colors.surfaceHigh` |
| Tag border | `#2a2d38` | `colors.borderStrong` |
| Tag text | `12px #888` | `fontSize.sm colors.textMuted` |

### `src/components/ReportHistory.jsx`

| Element | Before | After |
|---|---|---|
| Container background | `#0b0c0f` | `colors.bg` |
| Container border | `#1e2028` | `colors.border` |
| "Recent Reports" label | `10px #555` | `fontSize.xs colors.textMuted` |
| "Clear all" button | `11px #444` | `fontSize.sm colors.textMuted` |
| Entry background | `#111318` | `colors.surface` |
| Entry border | `#1e2028` | `colors.border` |
| Entry title | `13px #ccc` | `fontSize.md colors.textSecondary` |
| Entry timestamp | `10px #444` | `fontSize.xs colors.textMuted` |
| Delete button | `#333` | `colors.textMuted` |

### `src/components/OnboardingModal.jsx`

| Element | Before | After |
|---|---|---|
| Modal card background | `#111318` | `colors.surface` |
| Modal card border | `#1e2028` | `colors.border` |
| Modal header background | `#0e1013` | `colors.surfaceHigh` |
| Close button color | `#444` | `colors.textMuted` |
| Step description | `13px #666` | `fontSize.sm colors.textMuted` |
| Dot (inactive) | `#2a2d38` | `colors.borderStrong` |
| Dot (active) | `#ff2d2d` | `colors.accent` |
| Back button border | `#2a2d38` | `colors.borderStrong` |
| Back button text | `#666` | `colors.textMuted` |

### `src/components/ExportMenu.jsx`

| Element | Before | After |
|---|---|---|
| Button border (default) | `#2a2d38` | `colors.borderStrong` |
| Button text (default) | `#888` | `colors.textMuted` |
| Button border-radius | `10px` | `radius.md` |

Note: copied (`#00c48c`) and error (`#ff2d2d` / `#ff6b6b`) states are feedback colors — leave them unchanged.

---

## What Does NOT Change

- Brand colors: red accent `#ff2d2d`, severity colors (Critical/High/Medium/Low)
- Font families: `DM Mono`, `Bebas Neue`
- Layout, grid structure, component hierarchy
- All logic, hooks, and non-visual code
- Existing tests (no behaviour changes)

---

## Build Sequence

1. Create `src/theme.js` with all tokens
2. Update `App.jsx`
3. Update `ApiKeySetup.jsx`
4. Update `BugInput.jsx`
5. Update `ReportCard.jsx`
6. Update `ReportHistory.jsx`
7. Update `OnboardingModal.jsx`
8. Update `ExportMenu.jsx`
9. Run existing test suite — confirm no regressions
10. Visual check in browser across all three screens
