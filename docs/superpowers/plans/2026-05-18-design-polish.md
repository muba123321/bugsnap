# Design Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded colour/size magic strings with a shared token object (`src/theme.js`) and apply the Deep Navy palette across all six components and App.jsx.

**Architecture:** Create `src/theme.js` first (pure data, no imports). Each component then imports `{ colors, fontSize, radius }` from it and replaces every hardcoded design value. No logic, layout, or test changes — style only.

**Tech Stack:** React 18, Vite, inline styles (existing pattern), Vitest for regression guard.

---

## File Map

| Action | File |
|---|---|
| Create | `src/theme.js` |
| Modify | `src/App.jsx` |
| Modify | `src/components/ApiKeySetup.jsx` |
| Modify | `src/components/BugInput.jsx` |
| Modify | `src/components/ReportCard.jsx` |
| Modify | `src/components/ReportHistory.jsx` |
| Modify | `src/components/OnboardingModal.jsx` |
| Modify | `src/components/ExportMenu.jsx` |

---

## Task 1: Create `src/theme.js`

**Files:**
- Create: `src/theme.js`

- [ ] **Step 1: Write the token file**

```js
// src/theme.js
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

- [ ] **Step 2: Run the test suite to confirm baseline passes**

```bash
npm test -- --run
```

Expected: all tests pass (establishes baseline before any component changes).

- [ ] **Step 3: Commit**

```bash
git add src/theme.js
git commit -m "feat: add design token file (deep navy palette)"
```

---

## Task 2: Update `src/App.jsx`

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import { useState } from 'react'
import { generateReport } from './lib/generateReport'
import { useApiKey } from './hooks/useApiKey'
import { useReportHistory } from './hooks/useReportHistory'
import ApiKeySetup from './components/ApiKeySetup'
import BugInput from './components/BugInput'
import ReportCard from './components/ReportCard'
import ReportHistory from './components/ReportHistory'
import OnboardingModal, { useOnboarding } from './components/OnboardingModal'
import { colors, fontSize } from './theme'

const BugIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
  </svg>
)

const howItWorksSteps = [
  { emoji: '🔑', title: 'Get API Key', desc: 'Grab a free key from console.anthropic.com' },
  { emoji: '🐛', title: 'Describe the Bug', desc: 'Type it out in plain English — messy is fine' },
  { emoji: '⚡', title: 'Get Your Report', desc: 'Copy as Text or Markdown and paste anywhere' },
]

export default function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const { history, addReport, removeReport, clearHistory } = useReportHistory()
  const { show: showOnboarding, dismiss: dismissOnboarding, reopen: reopenOnboarding } = useOnboarding()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isInvalidKey, setIsInvalidKey] = useState(false)

  if (!apiKey) return (
    <>
      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}
      <ApiKeySetup onSave={setApiKey} />
    </>
  )

  async function handleGenerate(inputText) {
    setLoading(true)
    setError('')
    setIsInvalidKey(false)
    setReport(null)
    try {
      const result = await generateReport(inputText, apiKey)
      setReport(result)
      addReport({
        id: crypto.randomUUID(),
        title: result.title,
        severity: result.severity,
        timestamp: Date.now(),
        report: result,
      })
    } catch (err) {
      if (err.message === 'INVALID_KEY') {
        setIsInvalidKey(true)
        setError('Invalid API key. Please update it.')
      } else {
        const detail = err.message?.startsWith('NETWORK_ERROR:')
          ? err.message.replace('NETWORK_ERROR: ', '')
          : 'Something went wrong. Please try again.'
        setError(detail)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: "'DM Mono', 'Courier New', monospace", color: colors.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        @media (max-width: 600px) {
          .hero-header { padding: 24px 20px !important; }
          .app-title { font-size: 32px !important; }
          .main-content { padding: 32px 16px !important; }
          .how-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showOnboarding && <OnboardingModal onDismiss={dismissOnboarding} />}

      <div className="hero-header" style={{ background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.surface} 100%)`, borderBottom: `1px solid ${colors.border}`, padding: '36px 40px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', background: colors.accent, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(255,45,45,0.4)' }}>
          <BugIcon />
        </div>
        <div>
          <div className="app-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>BugSnap</div>
          <div style={{ fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>AI-Powered Bug Report Generator</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={reopenOnboarding}
            title="How it works"
            style={{
              width: '32px', height: '32px',
              background: colors.surface, border: `1px solid ${colors.borderStrong}`,
              borderRadius: '50%', color: colors.textMuted,
              fontSize: fontSize.sm, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >?</button>
          <button onClick={clearApiKey} style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: fontSize.xs, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
            Update API key
          </button>
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${colors.border}`, background: colors.surfaceHigh, padding: '20px 40px' }}>
        <div className="how-grid" style={{ maxWidth: '780px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {howItWorksSteps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: colors.surface, border: `1px solid ${colors.borderStrong}`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                {s.emoji}
              </div>
              <div>
                <div style={{ fontSize: fontSize.xs, color: colors.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '2px' }}>
                  Step {i + 1} — {s.title}
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted, lineHeight: '1.5' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-content" style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px' }}>
        <BugInput onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: '8px', fontSize: fontSize.md, color: '#ff6b6b' }}>
            {error}
            {isInvalidKey && (
              <button onClick={clearApiKey} style={{ marginLeft: '8px', background: 'none', border: 'none', color: colors.accent, cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: fontSize.md, textDecoration: 'underline' }}>
                Update it
              </button>
            )}
          </div>
        )}

        {report && <ReportCard report={report} />}

        <ReportHistory
          history={history}
          onSelect={r => { setReport(r); setError(''); setIsInvalidKey(false) }}
          onRemove={removeReport}
          onClear={clearHistory}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "style: apply design tokens to App.jsx"
```

---

## Task 3: Update `src/components/ApiKeySetup.jsx`

**Files:**
- Modify: `src/components/ApiKeySetup.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import { useState } from 'react'
import { colors, fontSize } from '../theme'

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!key.startsWith('sk-ant')) {
      setError('Invalid API key — must start with sk-ant')
      return
    }
    setError('')
    onSave(key.trim())
  }

  return (
    <div style={{
      minHeight: '100vh', background: colors.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', 'Courier New', monospace", padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '3px', color: '#fff', marginBottom: '8px' }}>
          CONNECT YOUR API KEY
        </div>
        <div style={{ fontSize: fontSize.md, color: colors.textMuted, marginBottom: '28px', lineHeight: '1.7' }}>
          BugSnap uses the Anthropic Claude API.<br />
          Your key is stored locally — never sent to us.
        </div>
        <input
          type="password"
          placeholder="sk-ant-api03-..."
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          style={{
            width: '100%', background: colors.surface,
            border: `1px solid ${error ? colors.accent : colors.border}`,
            borderRadius: '8px', padding: '14px', color: colors.textPrimary,
            fontFamily: 'inherit', fontSize: fontSize.base, marginBottom: '8px', outline: 'none',
          }}
        />
        {error && (
          <div style={{ color: '#ff6b6b', fontSize: fontSize.sm, marginBottom: '12px', textAlign: 'left' }}>
            {error}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          style={{
            width: '100%', padding: '14px',
            background: key.trim() ? colors.accent : colors.border,
            color: '#fff', border: 'none', borderRadius: '8px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
            letterSpacing: '3px', cursor: key.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          SAVE &amp; CONTINUE
        </button>
        <div style={{ marginTop: '16px', fontSize: fontSize.sm, color: colors.textMuted }}>
          Get your key at console.anthropic.com
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/ApiKeySetup.jsx
git commit -m "style: apply design tokens to ApiKeySetup"
```

---

## Task 4: Update `src/components/BugInput.jsx`

**Files:**
- Modify: `src/components/BugInput.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import { useState } from 'react'
import { colors, fontSize } from '../theme'

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.47L19 10l-5.12 1.53L12 17l-1.88-5.47L5 10l5.12-1.53L12 3z"/>
    <path d="M5 3l.88 2.47L8 6l-2.12.53L5 9l-.88-2.47L2 6l2.12-.53L5 3z"/>
    <path d="M19 15l.88 2.47L22 18l-2.12.53L19 21l-.88-2.47L16 18l2.12-.53L19 15z"/>
  </svg>
)

export default function BugInput({ onGenerate, loading }) {
  const [input, setInput] = useState('')

  return (
    <div>
      <label style={{ display: 'block', fontSize: fontSize.sm, letterSpacing: '2px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '12px' }}>
        Describe the bug (messy is fine)
      </label>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
        placeholder={`e.g. "the login button doesn't work on mobile after password reset..."`}
        style={{
          width: '100%', minHeight: '140px', background: colors.surface,
          border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '18px',
          color: colors.textSecondary, fontFamily: "'DM Mono', monospace", fontSize: fontSize.base,
          resize: 'vertical', outline: 'none', lineHeight: '1.7',
        }}
      />
      <button
        onClick={() => onGenerate(input)}
        disabled={loading || !input.trim()}
        style={{
          marginTop: '16px', width: '100%', padding: '16px', background: colors.accent,
          color: '#fff', border: 'none', borderRadius: '10px',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '10px', opacity: (loading || !input.trim()) ? 0.5 : 1, transition: 'all 0.2s',
        }}
      >
        {loading ? (
          <span>
            <span style={{ animation: 'blink 1.2s infinite' }}>●</span>
            <span style={{ animation: 'blink 1.2s infinite', animationDelay: '0.2s' }}>●</span>
            <span style={{ animation: 'blink 1.2s infinite', animationDelay: '0.4s' }}>●</span>
          </span>
        ) : (
          <><SparkleIcon /> GENERATE REPORT</>
        )}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/BugInput.jsx
git commit -m "style: apply design tokens to BugInput"
```

---

## Task 5: Update `src/components/ReportCard.jsx`

**Files:**
- Modify: `src/components/ReportCard.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import ExportMenu from './ExportMenu'
import { colors, fontSize } from '../theme'

const SEVERITY_COLORS = {
  Critical: { bg: '#ff2d2d', text: '#fff' },
  High:     { bg: '#ff6b00', text: '#fff' },
  Medium:   { bg: '#f5c400', text: '#1a1a1a' },
  Low:      { bg: '#00c48c', text: '#fff' },
}

const sectionLabel = {
  fontSize: fontSize.xs, letterSpacing: '2.5px', textTransform: 'uppercase',
  color: colors.accent, marginBottom: '10px',
}

export default function ReportCard({ report }) {
  const severityColor = SEVERITY_COLORS[report.severity] ?? { bg: '#333', text: '#fff' }

  return (
    <div style={{ marginTop: '40px', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '14px', overflow: 'hidden', animation: 'slideUp 0.4s ease' }}>
      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', background: colors.surfaceHigh }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '1.5px', color: colors.textPrimary, lineHeight: '1.2', flex: 1 }}>
          {report.title}
        </div>
        <div role="status" aria-label={`Severity: ${report.severity}`} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: fontSize.xs, fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', flexShrink: 0, background: severityColor.bg, color: severityColor.text }}>
          {report.severity}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={sectionLabel}>Environment</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {Object.entries(report.environment).map(([k, v]) => (
              <div key={k} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{k}</div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={sectionLabel}>Steps to Reproduce</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', background: colors.border, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fontSize.xs, color: colors.accent, flexShrink: 0, marginTop: '1px' }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: '1.6' }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[['Expected', report.expected], ['Actual', report.actual]].map(([label, text]) => (
            <div key={label}>
              <div style={sectionLabel}>{label}</div>
              <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '14px 16px', fontSize: fontSize.md, color: colors.textSecondary, lineHeight: '1.6' }}>
                {text}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={sectionLabel}>Tags</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {report.tags.map(tag => (
              <div key={tag} style={{ background: colors.surfaceHigh, border: `1px solid ${colors.borderStrong}`, borderRadius: '6px', padding: '5px 12px', fontSize: fontSize.sm, color: colors.textMuted, letterSpacing: '0.5px' }}>
                #{tag}
              </div>
            ))}
          </div>
        </div>

        <ExportMenu report={report} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReportCard.jsx
git commit -m "style: apply design tokens to ReportCard"
```

---

## Task 6: Update `src/components/ReportHistory.jsx`

**Files:**
- Modify: `src/components/ReportHistory.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import { useState } from 'react'
import { colors, fontSize } from '../theme'

const SEVERITY_COLORS = {
  Critical: '#ff2d2d', High: '#ff6b00', Medium: '#f5c400', Low: '#00c48c',
}

function formatDate(timestamp) {
  const diffMins = Math.floor((Date.now() - timestamp) / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return new Date(timestamp).toLocaleDateString()
}

export default function ReportHistory({ history, onSelect, onRemove, onClear }) {
  const [collapsed, setCollapsed] = useState(false)

  if (history.length === 0) return null

  return (
    <div style={{ marginTop: '24px', background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: collapsed ? 'none' : `1px solid ${colors.border}` }}>
        <div style={{ fontSize: fontSize.xs, letterSpacing: '2px', color: colors.textMuted, textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
          Recent Reports ({history.length})
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={onClear} aria-label="clear all" style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: fontSize.sm, cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
            Clear all
          </button>
          <button onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'expand' : 'collapse'} style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: fontSize.sm, cursor: 'pointer' }}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map(entry => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelect(entry.report)}>
                <div style={{ fontSize: fontSize.xs, color: SEVERITY_COLORS[entry.severity] ?? colors.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {entry.severity}
                </div>
                <div style={{ fontSize: fontSize.md, color: colors.textSecondary, lineHeight: '1.4' }}>{entry.title}</div>
                <div style={{ fontSize: fontSize.xs, color: colors.textMuted, marginTop: '4px' }}>{formatDate(entry.timestamp)}</div>
              </div>
              <button onClick={() => onRemove(entry.id)} aria-label="delete" style={{ background: 'none', border: 'none', color: colors.textMuted, fontSize: '14px', cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/ReportHistory.jsx
git commit -m "style: apply design tokens to ReportHistory"
```

---

## Task 7: Update `src/components/OnboardingModal.jsx`

**Files:**
- Modify: `src/components/OnboardingModal.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import { useState, useEffect } from 'react'
import { colors, fontSize } from '../theme'

const STORAGE_KEY = 'bugsnap_onboarded'

const steps = [
  {
    emoji: '🔑',
    title: 'Get Your API Key',
    description: 'Go to console.anthropic.com, sign up for free, and create an API key. Paste it into BugSnap — it stays on your device, never sent to us.',
  },
  {
    emoji: '🐛',
    title: 'Describe Your Bug',
    description: 'Type your bug description in plain English — messy is totally fine. No need to format anything. Just explain what went wrong.',
  },
  {
    emoji: '⚡',
    title: 'Get Your Report',
    description: 'BugSnap instantly generates a clean, structured bug report with steps, severity, environment, and tags. Copy it as Text or Markdown.',
  },
]

export function useOnboarding() {
  const [show, setShow] = useState(() => !localStorage.getItem(STORAGE_KEY))

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  function reopen() {
    setShow(true)
  }

  return { show, dismiss, reopen }
}

export default function OnboardingModal({ onDismiss }) {
  const [step, setStep] = useState(0)
  const isLast = step === steps.length - 1

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onDismiss()
      if (e.key === 'ArrowRight' && !isLast) setStep(s => s + 1)
      if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [step, isLast, onDismiss])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Mono', 'Courier New', monospace",
      animation: 'fadeIn 0.2s ease',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '480px',
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: colors.surfaceHigh,
        }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px', color: '#fff' }}>
            HOW IT WORKS
          </div>
          <button onClick={onDismiss} style={{
            background: 'none', border: 'none', color: colors.textMuted,
            fontSize: '18px', cursor: 'pointer', lineHeight: 1,
          }}>✕</button>
        </div>

        <div style={{ padding: '36px 32px', textAlign: 'center', minHeight: '220px' }}>
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>{steps[step].emoji}</div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '22px', letterSpacing: '2px', color: '#fff',
            marginBottom: '12px',
          }}>
            {steps[step].title}
          </div>
          <div style={{ fontSize: fontSize.sm, color: colors.textMuted, lineHeight: '1.8', maxWidth: '340px', margin: '0 auto' }}>
            {steps[step].description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingBottom: '8px' }}>
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === step ? colors.accent : colors.borderStrong,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <div style={{ padding: '16px 24px 24px', display: 'flex', gap: '10px' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                flex: 1, padding: '13px',
                background: 'transparent',
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: '8px', color: colors.textMuted,
                fontFamily: "'DM Mono', monospace",
                fontSize: fontSize.sm, letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              ← BACK
            </button>
          )}
          <button
            onClick={isLast ? onDismiss : () => setStep(s => s + 1)}
            style={{
              flex: 2, padding: '13px',
              background: colors.accent,
              border: 'none',
              borderRadius: '8px', color: '#fff',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '16px', letterSpacing: '2px',
              cursor: 'pointer',
            }}
          >
            {isLast ? "LET'S GO →" : 'NEXT →'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/OnboardingModal.jsx
git commit -m "style: apply design tokens to OnboardingModal"
```

---

## Task 8: Update `src/components/ExportMenu.jsx`

**Files:**
- Modify: `src/components/ExportMenu.jsx`

- [ ] **Step 1: Replace the file contents**

```jsx
import { useState, useEffect } from 'react'
import { formatReport } from '../lib/formatReport'
import { colors, fontSize, radius } from '../theme'

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

function CopyButton({ label, format, report }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  useEffect(() => {
    if (!error) return
    const id = setTimeout(() => setError(false), 2000)
    return () => clearTimeout(id)
  }, [error])

  function handleCopy() {
    navigator.clipboard.writeText(formatReport(report, format))
      .then(() => setCopied(true))
      .catch(() => setError(true))
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        flex: 1, padding: '13px', background: 'transparent',
        border: `1px solid ${copied ? '#00c48c' : error ? colors.accent : colors.borderStrong}`,
        borderRadius: radius.md,
        color: copied ? '#00c48c' : error ? '#ff6b6b' : colors.textMuted,
        fontFamily: "'DM Mono', monospace", fontSize: fontSize.sm,
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', letterSpacing: '1px', transition: 'all 0.2s',
      }}
    >
      <CopyIcon />
      {copied ? 'COPIED!' : error ? 'FAILED' : label}
    </button>
  )
}

export default function ExportMenu({ report }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
      <CopyButton label="COPY TEXT" format="text" report={report} />
      <CopyButton label="COPY MARKDOWN" format="markdown" report={report} />
    </div>
  )
}
```

- [ ] **Step 2: Run tests**

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExportMenu.jsx
git commit -m "style: apply design tokens to ExportMenu"
```

---

## Task 9: Visual verification

**Files:** None — read-only check.

- [ ] **Step 1: Confirm dev server is running**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```

Expected: `200`. If not, run `npm run dev` first.

- [ ] **Step 2: Check the three screens**

Open http://localhost:5173 in your browser and verify:

**ApiKeySetup + Onboarding (new user flow):**
- Clear `bugsnap_onboarded` from DevTools → Application → Local Storage, then reload
- Onboarding modal appears over ApiKeySetup with navy backgrounds and readable text
- Step description text is clearly legible (not squinting required)
- Progress dots: active dot is red, inactive dots are visible navy-blue
- "Get your key at console.anthropic.com" link is visible at the bottom of ApiKeySetup

**Main app:**
- How-it-works strip step descriptions are clearly readable (no more near-invisible `#444` text)
- `?` button and "Update API key" text are visible in the header
- Generate a report and check the ReportCard: environment key labels, step text, Expected/Actual values, and tags are all clearly readable
- Export buttons (COPY TEXT / COPY MARKDOWN) border and text are visible at rest

- [ ] **Step 3: Final commit if any last-minute tweaks were needed**

If step 2 revealed anything needing adjustment, fix it and commit:

```bash
git add -p
git commit -m "style: visual polish tweaks after browser review"
```

If everything looks good, no commit needed.
