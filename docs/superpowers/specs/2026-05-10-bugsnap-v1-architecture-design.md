# BugSnap v1 — Architecture Design

**Date:** 2026-05-10  
**Status:** Approved  
**Scope:** Frontend-only refactor with component split, secure API key handling, report history, and Markdown export

---

## Problem

The current `App.jsx` is a 517-line god component that:
- Calls the Anthropic API directly from the browser with a build-time env var (`VITE_ANTHROPIC_API_KEY`), exposing the key to anyone who opens DevTools
- Mixes all UI, business logic, API calls, and formatting in one file
- Loses all reports on page refresh
- Only supports one copy format (plain text)

---

## Goals

1. Secure API key handling — key stored in `localStorage`, user-supplied on first visit
2. Clean component architecture — each file has one job
3. Report history — last 10 reports persisted in `localStorage`
4. Markdown export — copy report formatted for GitHub issues alongside existing plain-text copy
5. No backend, no database — stays deployable as a static site on Vercel

---

## Architecture

### Component Tree

```
App.jsx                    ← thin orchestrator, holds top-level state
├── ApiKeySetup.jsx        ← fullscreen onboarding, shown only when no key in localStorage
├── BugInput.jsx           ← textarea + generate button, emits onGenerate(text)
├── ReportCard.jsx         ← structured report display, receives report prop
│   └── ExportMenu.jsx     ← copy plain text / copy markdown buttons
└── ReportHistory.jsx      ← collapsible bottom drawer, last 10 reports from localStorage
```

### Hooks

| Hook | Responsibility |
|---|---|
| `useApiKey` | Read/write API key in `localStorage`; exposes `apiKey`, `setApiKey`, `clearApiKey` |
| `useReportHistory` | Read/write report history array in `localStorage`; exposes `history`, `addReport`, `removeReport`, `clearHistory` |

### Lib (pure functions, no React)

| File | Responsibility |
|---|---|
| `lib/generateReport.js` | Takes `(inputText, apiKey)` → calls Anthropic API → returns parsed report object. Retries once on JSON parse failure. |
| `lib/formatReport.js` | Takes `(report, format)` where `format` is `'text'` or `'markdown'` → returns formatted string |

---

## Data Flow

```
User types bug description → BugInput
  → App calls generateReport(text, apiKey)
    → reads key from useApiKey hook
    → POSTs to Anthropic API
    → parses JSON response
    → returns report object
  → App sets report state → ReportCard renders
  → App calls addReport(report) via useReportHistory
    → saves to localStorage (max 10, oldest dropped)
  → ReportHistory drawer updates automatically
```

---

## Key Behaviours

### API Key Onboarding

- On first visit (no key in localStorage), `ApiKeySetup` renders fullscreen
- Validates key starts with `sk-ant` before saving
- Saves to `localStorage` under key `bugsnap_api_key`
- Never shown again after key is saved
- Footer link "Update API key" clears the stored key and re-shows the setup screen

### Report History

- Stored in `localStorage` under key `bugsnap_history` as a JSON array
- Shape: `[{ id, title, severity, timestamp, report }]`
- Capped at 10 entries — oldest entry dropped when limit exceeded
- Clicking a history item loads that report into `ReportCard` with no API call
- Each item has a ✕ delete button
- "Clear all" link at the bottom of the drawer
- Drawer is hidden entirely when history is empty

### Export

- **Copy Plain Text** — existing behaviour, formats report as readable text block
- **Copy Markdown** — new, formats report as a Markdown document suitable for GitHub issues

Markdown format:
```markdown
## 🐛 [Title]

**Severity:** Critical | High | Medium | Low  
**Tags:** `tag1` `tag2`

### Environment
| Key | Value |
|---|---|
| Browser | ... |
| Device | ... |
| OS | ... |

### Steps to Reproduce
1. Step one
2. Step two

### Expected Behavior
...

### Actual Behavior
...
```

---

## UI Layout

Single-column layout, max-width 780px, centered. Layout top to bottom:

1. Header bar (logo + title) — unchanged
2. Bug input textarea
3. Generate button
4. Error message (inline, below button, hidden when no error)
5. Report card (slides in on success)
   - Report header (title + severity badge)
   - Environment grid
   - Steps to reproduce
   - Expected / Actual behavior (side by side)
   - Tags
   - Export menu (Copy Text | Copy Markdown)
6. Report history drawer (collapsible, hidden when empty)
   - Cards showing title + severity + timestamp
   - Clear all link

---

## App States

| State | What renders |
|---|---|
| No API key | `ApiKeySetup` fullscreen |
| Key set, no report | `BugInput` + empty (hidden) history drawer |
| Loading | `BugInput` locked, generate button shows animated dots |
| Report ready | `BugInput` + `ReportCard` + history drawer (if ≥1 report) |
| Error | Inline error below generate button; invalid key shows "Update API key" link |

---

## Error Handling

- **Invalid key format** (doesn't start with `sk-ant`): rejected at setup with inline message
- **401 from Anthropic API**: surface "Invalid API key" with link to update it
- **Network error**: "Something went wrong. Please try again."
- **JSON parse failure**: retry once silently; if second attempt fails, surface "Something went wrong."
- **Empty input**: generate button disabled when textarea is empty (existing behaviour)

---

## File Structure After Refactor

```
src/
  components/
    ApiKeySetup.jsx
    BugInput.jsx
    ReportCard.jsx
    ExportMenu.jsx
    ReportHistory.jsx
  hooks/
    useApiKey.js
    useReportHistory.js
  lib/
    generateReport.js
    formatReport.js
  App.jsx
  main.jsx
```

---

## Out of Scope (v1)

- Backend / server-side API proxy
- Database persistence
- User accounts or auth
- Direct integrations (GitHub, Jira, Linear)
- File download (`.md`, `.json`)
- Templates or custom report fields
- Tailwind CSS (keeping inline styles for now)
