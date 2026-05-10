# BugSnap v1 Architecture Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor BugSnap from a 517-line god component into a tested, component-split architecture with secure user-supplied API key, report history, and Markdown export.

**Architecture:** Frontend-only React app. API key stored in localStorage (user-supplied on first visit). Report history (last 10) persisted in localStorage. App.jsx becomes a thin orchestrator wiring focused components, hooks, and pure lib functions.

**Tech Stack:** React 18, Vite 5, Vitest, @testing-library/react, Anthropic Claude API (`claude-sonnet-4-6`)

---

## File Map

**Create:**
- `src/lib/generateReport.js` — Anthropic API call, parses JSON response, retries once on parse failure
- `src/lib/formatReport.js` — pure formatters: `(report, 'text'|'markdown')` → string
- `src/hooks/useApiKey.js` — localStorage CRUD for API key
- `src/hooks/useReportHistory.js` — localStorage CRUD for history array (max 10)
- `src/components/ApiKeySetup.jsx` — fullscreen onboarding, shown once when no key
- `src/components/BugInput.jsx` — textarea + generate button
- `src/components/ExportMenu.jsx` — copy text / copy markdown buttons
- `src/components/ReportCard.jsx` — structured report display, renders ExportMenu
- `src/components/ReportHistory.jsx` — collapsible bottom drawer, last 10 reports
- `src/test-setup.js` — testing globals
- `src/lib/generateReport.test.js`
- `src/lib/formatReport.test.js`
- `src/hooks/useApiKey.test.js`
- `src/hooks/useReportHistory.test.js`
- `src/components/ApiKeySetup.test.jsx`
- `src/components/BugInput.test.jsx`
- `src/components/ExportMenu.test.jsx`
- `src/components/ReportCard.test.jsx`
- `src/components/ReportHistory.test.jsx`

**Modify:**
- `src/App.jsx` — replace with thin orchestrator
- `vite.config.js` — add vitest config block
- `package.json` — add test script and dev deps
- `.env` — remove VITE_ANTHROPIC_API_KEY (key moves to localStorage)

---

### Task 1: Install Vitest and configure testing

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `src/test-setup.js`

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Expected: `added N packages` with no errors.

- [ ] **Step 2: Add test script to package.json**

In `package.json`, add `"test": "vitest"` to the scripts section so it reads:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest"
}
```

- [ ] **Step 3: Update vite.config.js**

Replace `vite.config.js` entirely with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

- [ ] **Step 4: Create src/test-setup.js**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Verify setup**

```bash
npm test -- --run
```

Expected: exits with "no test files found" or 0 tests — no errors.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js src/test-setup.js
git commit -m "chore: set up Vitest and Testing Library"
```

---

### Task 2: Create lib/generateReport.js

**Files:**
- Create: `src/lib/generateReport.js`
- Create: `src/lib/generateReport.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/generateReport.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateReport } from './generateReport'

const MOCK_REPORT = {
  title: 'Login button broken on mobile',
  environment: { browser: 'Safari', device: 'Mobile', os: 'iOS 17' },
  steps: ['Open the app', 'Tap login'],
  expected: 'User is logged in',
  actual: 'Nothing happens',
  severity: 'Critical',
  tags: ['auth', 'mobile'],
}

describe('generateReport', () => {
  beforeEach(() => { global.fetch = vi.fn() })
  afterEach(() => { vi.restoreAllMocks() })

  it('returns parsed report on success', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true, status: 200,
      json: () => Promise.resolve({ content: [{ type: 'text', text: JSON.stringify(MOCK_REPORT) }] }),
    })
    const result = await generateReport('login broken on mobile', 'sk-ant-test')
    expect(result).toEqual(MOCK_REPORT)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({ headers: expect.objectContaining({ 'x-api-key': 'sk-ant-test' }) })
    )
  })

  it('retries once on JSON parse failure then succeeds', async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ content: [{ type: 'text', text: 'not json' }] }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ content: [{ type: 'text', text: JSON.stringify(MOCK_REPORT) }] }) })
    const result = await generateReport('some bug', 'sk-ant-test')
    expect(result).toEqual(MOCK_REPORT)
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('throws INVALID_KEY on 401', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401, json: () => Promise.resolve({}) })
    await expect(generateReport('some bug', 'bad-key')).rejects.toThrow('INVALID_KEY')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('throws after two consecutive JSON parse failures', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve({ content: [{ type: 'text', text: 'bad json' }] }) })
    await expect(generateReport('some bug', 'sk-ant-test')).rejects.toThrow()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/lib/generateReport.test.js
```

Expected: FAIL — `Cannot find module './generateReport'`

- [ ] **Step 3: Create src/lib/generateReport.js**

```js
const SYSTEM_PROMPT = `You are a senior QA engineer. Given an informal bug description, generate a structured bug report in valid JSON only. No markdown, no backticks, no explanation — pure JSON.

Return this exact shape:
{
  "title": "Short clear bug title",
  "environment": {
    "browser": "e.g. Chrome 124 / Unknown",
    "device": "e.g. Mobile / Desktop / Unknown",
    "os": "e.g. iOS 17 / Windows 11 / Unknown"
  },
  "steps": ["Step 1", "Step 2", "Step 3"],
  "expected": "What should happen",
  "actual": "What actually happens",
  "severity": "Critical | High | Medium | Low",
  "tags": ["tag1", "tag2", "tag3"]
}`

async function callApi(inputText, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: inputText }],
    }),
  })
  if (response.status === 401) throw new Error('INVALID_KEY')
  if (!response.ok) throw new Error('NETWORK_ERROR')
  const data = await response.json()
  const raw = data.content?.find(b => b.type === 'text')?.text ?? ''
  return JSON.parse(raw.replace(/```json|```/g, '').trim())
}

export async function generateReport(inputText, apiKey) {
  try {
    return await callApi(inputText, apiKey)
  } catch (err) {
    if (err.message === 'INVALID_KEY' || err.message === 'NETWORK_ERROR') throw err
    return await callApi(inputText, apiKey)
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/lib/generateReport.test.js
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/generateReport.js src/lib/generateReport.test.js
git commit -m "feat: add generateReport with retry and auth error handling"
```

---

### Task 3: Create lib/formatReport.js

**Files:**
- Create: `src/lib/formatReport.js`
- Create: `src/lib/formatReport.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/lib/formatReport.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { formatReport } from './formatReport'

const REPORT = {
  title: 'Login button broken on mobile',
  environment: { browser: 'Safari 17', device: 'Mobile', os: 'iOS 17' },
  steps: ['Open the app', 'Tap the login button', 'Observe no response'],
  expected: 'User is logged in',
  actual: 'Nothing happens',
  severity: 'Critical',
  tags: ['auth', 'mobile', 'login'],
}

describe('formatReport - text', () => {
  it('includes bug title', () => expect(formatReport(REPORT, 'text')).toContain('Login button broken on mobile'))
  it('includes environment fields', () => {
    const r = formatReport(REPORT, 'text')
    expect(r).toContain('Safari 17')
    expect(r).toContain('Mobile')
    expect(r).toContain('iOS 17')
  })
  it('includes numbered steps', () => {
    const r = formatReport(REPORT, 'text')
    expect(r).toContain('1. Open the app')
    expect(r).toContain('2. Tap the login button')
  })
  it('includes expected and actual', () => {
    const r = formatReport(REPORT, 'text')
    expect(r).toContain('User is logged in')
    expect(r).toContain('Nothing happens')
  })
  it('includes severity and tags', () => {
    const r = formatReport(REPORT, 'text')
    expect(r).toContain('Critical')
    expect(r).toContain('auth')
  })
})

describe('formatReport - markdown', () => {
  it('starts with h2 bug title', () => expect(formatReport(REPORT, 'markdown')).toMatch(/^## 🐛 Login button broken on mobile/))
  it('includes severity as bold', () => expect(formatReport(REPORT, 'markdown')).toContain('**Severity:** Critical'))
  it('includes tags as inline code', () => {
    const r = formatReport(REPORT, 'markdown')
    expect(r).toContain('`auth`')
    expect(r).toContain('`mobile`')
  })
  it('includes environment as markdown table', () => {
    const r = formatReport(REPORT, 'markdown')
    expect(r).toContain('| Browser | Safari 17 |')
    expect(r).toContain('| Device | Mobile |')
  })
  it('includes steps under h3', () => {
    const r = formatReport(REPORT, 'markdown')
    expect(r).toContain('### Steps to Reproduce')
    expect(r).toContain('1. Open the app')
  })
  it('includes expected/actual under h3 headings', () => {
    const r = formatReport(REPORT, 'markdown')
    expect(r).toContain('### Expected Behavior')
    expect(r).toContain('### Actual Behavior')
  })
})

it('throws on unknown format', () => expect(() => formatReport(REPORT, 'xml')).toThrow())
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/lib/formatReport.test.js
```

Expected: FAIL — `Cannot find module './formatReport'`

- [ ] **Step 3: Create src/lib/formatReport.js**

```js
export function formatReport(report, format) {
  if (format === 'text') return formatAsText(report)
  if (format === 'markdown') return formatAsMarkdown(report)
  throw new Error(`Unknown format: ${format}`)
}

function formatAsText(report) {
  return `BUG REPORT — ${report.title}
${'─'.repeat(50)}

SEVERITY: ${report.severity}
TAGS: ${report.tags.join(', ')}

ENVIRONMENT
  Browser : ${report.environment.browser}
  Device  : ${report.environment.device}
  OS      : ${report.environment.os}

STEPS TO REPRODUCE
${report.steps.map((s, i) => `  ${i + 1}. ${s}`).join('\n')}

EXPECTED BEHAVIOR
  ${report.expected}

ACTUAL BEHAVIOR
  ${report.actual}`.trim()
}

function formatAsMarkdown(report) {
  const tags = report.tags.map(t => `\`${t}\``).join(' ')
  const steps = report.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
  return `## 🐛 ${report.title}

**Severity:** ${report.severity}
**Tags:** ${tags}

### Environment

| Key | Value |
|---|---|
| Browser | ${report.environment.browser} |
| Device | ${report.environment.device} |
| OS | ${report.environment.os} |

### Steps to Reproduce

${steps}

### Expected Behavior

${report.expected}

### Actual Behavior

${report.actual}`.trim()
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/lib/formatReport.test.js
```

Expected: PASS — 12 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/formatReport.js src/lib/formatReport.test.js
git commit -m "feat: add formatReport for text and markdown formats"
```

---

### Task 4: Create hooks/useApiKey.js

**Files:**
- Create: `src/hooks/useApiKey.js`
- Create: `src/hooks/useApiKey.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useApiKey.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApiKey } from './useApiKey'

describe('useApiKey', () => {
  beforeEach(() => localStorage.clear())

  it('returns null when no key stored', () => {
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBeNull()
  })

  it('returns stored key on mount', () => {
    localStorage.setItem('bugsnap_api_key', 'sk-ant-existing')
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('sk-ant-existing')
  })

  it('setApiKey stores key and updates state', () => {
    const { result } = renderHook(() => useApiKey())
    act(() => result.current.setApiKey('sk-ant-new'))
    expect(result.current.apiKey).toBe('sk-ant-new')
    expect(localStorage.getItem('bugsnap_api_key')).toBe('sk-ant-new')
  })

  it('clearApiKey removes key from storage and sets null', () => {
    localStorage.setItem('bugsnap_api_key', 'sk-ant-existing')
    const { result } = renderHook(() => useApiKey())
    act(() => result.current.clearApiKey())
    expect(result.current.apiKey).toBeNull()
    expect(localStorage.getItem('bugsnap_api_key')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/hooks/useApiKey.test.js
```

Expected: FAIL — `Cannot find module './useApiKey'`

- [ ] **Step 3: Create src/hooks/useApiKey.js**

```js
import { useState } from 'react'

const STORAGE_KEY = 'bugsnap_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem(STORAGE_KEY))

  function setApiKey(key) {
    localStorage.setItem(STORAGE_KEY, key)
    setApiKeyState(key)
  }

  function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY)
    setApiKeyState(null)
  }

  return { apiKey, setApiKey, clearApiKey }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/hooks/useApiKey.test.js
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useApiKey.js src/hooks/useApiKey.test.js
git commit -m "feat: add useApiKey hook"
```

---

### Task 5: Create hooks/useReportHistory.js

**Files:**
- Create: `src/hooks/useReportHistory.js`
- Create: `src/hooks/useReportHistory.test.js`

- [ ] **Step 1: Write failing tests**

Create `src/hooks/useReportHistory.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useReportHistory } from './useReportHistory'

const makeEntry = (id, title = 'Bug', severity = 'Low') => ({
  id, title, severity,
  timestamp: Date.now(),
  report: { title, environment: {}, steps: [], expected: '', actual: '', severity, tags: [] },
})

describe('useReportHistory', () => {
  beforeEach(() => localStorage.clear())

  it('returns empty array when no history', () => {
    const { result } = renderHook(() => useReportHistory())
    expect(result.current.history).toEqual([])
  })

  it('addReport prepends to history', () => {
    const { result } = renderHook(() => useReportHistory())
    act(() => result.current.addReport(makeEntry('1', 'First bug')))
    act(() => result.current.addReport(makeEntry('2', 'Second bug')))
    expect(result.current.history[0].title).toBe('Second bug')
    expect(result.current.history[1].title).toBe('First bug')
  })

  it('addReport caps history at 10 entries', () => {
    const { result } = renderHook(() => useReportHistory())
    for (let i = 1; i <= 11; i++) {
      act(() => result.current.addReport(makeEntry(String(i), `Bug ${i}`)))
    }
    expect(result.current.history).toHaveLength(10)
    expect(result.current.history[0].title).toBe('Bug 11')
    expect(result.current.history[9].title).toBe('Bug 2')
  })

  it('removeReport removes entry by id', () => {
    const { result } = renderHook(() => useReportHistory())
    act(() => result.current.addReport(makeEntry('a', 'Alpha')))
    act(() => result.current.addReport(makeEntry('b', 'Beta')))
    act(() => result.current.removeReport('a'))
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].id).toBe('b')
  })

  it('clearHistory empties the list and persists', () => {
    const { result } = renderHook(() => useReportHistory())
    act(() => result.current.addReport(makeEntry('1', 'A bug')))
    act(() => result.current.clearHistory())
    expect(result.current.history).toEqual([])
    expect(localStorage.getItem('bugsnap_history')).toBe('[]')
  })

  it('persists history to localStorage on addReport', () => {
    const { result } = renderHook(() => useReportHistory())
    act(() => result.current.addReport(makeEntry('1', 'Persisted bug')))
    const stored = JSON.parse(localStorage.getItem('bugsnap_history'))
    expect(stored[0].title).toBe('Persisted bug')
  })

  it('loads history from localStorage on mount', () => {
    const entry = makeEntry('x', 'Existing bug')
    localStorage.setItem('bugsnap_history', JSON.stringify([entry]))
    const { result } = renderHook(() => useReportHistory())
    expect(result.current.history[0].title).toBe('Existing bug')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/hooks/useReportHistory.test.js
```

Expected: FAIL — `Cannot find module './useReportHistory'`

- [ ] **Step 3: Create src/hooks/useReportHistory.js**

```js
import { useState } from 'react'

const STORAGE_KEY = 'bugsnap_history'
const MAX_HISTORY = 10

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [] }
  catch { return [] }
}

function save(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useReportHistory() {
  const [history, setHistory] = useState(load)

  function addReport(entry) {
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY)
      save(next)
      return next
    })
  }

  function removeReport(id) {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id)
      save(next)
      return next
    })
  }

  function clearHistory() {
    save([])
    setHistory([])
  }

  return { history, addReport, removeReport, clearHistory }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/hooks/useReportHistory.test.js
```

Expected: PASS — 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useReportHistory.js src/hooks/useReportHistory.test.js
git commit -m "feat: add useReportHistory hook with localStorage persistence"
```

---

### Task 6: Create components/ApiKeySetup.jsx

**Files:**
- Create: `src/components/ApiKeySetup.jsx`
- Create: `src/components/ApiKeySetup.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/ApiKeySetup.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeySetup from './ApiKeySetup'

describe('ApiKeySetup', () => {
  it('renders key input and save button', () => {
    render(<ApiKeySetup onSave={vi.fn()} />)
    expect(screen.getByPlaceholderText(/sk-ant/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('save button is disabled when input is empty', () => {
    render(<ApiKeySetup onSave={vi.fn()} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('shows error when key does not start with sk-ant', () => {
    render(<ApiKeySetup onSave={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText(/sk-ant/i), { target: { value: 'bad-key' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByText(/invalid api key/i)).toBeInTheDocument()
  })

  it('calls onSave with key when key starts with sk-ant', () => {
    const onSave = vi.fn()
    render(<ApiKeySetup onSave={onSave} />)
    fireEvent.change(screen.getByPlaceholderText(/sk-ant/i), { target: { value: 'sk-ant-valid' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledWith('sk-ant-valid')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/components/ApiKeySetup.test.jsx
```

Expected: FAIL — `Cannot find module './ApiKeySetup'`

- [ ] **Step 3: Create src/components/ApiKeySetup.jsx**

```jsx
import { useState } from 'react'

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')

  function handleSave() {
    if (!key.startsWith('sk-ant')) {
      setError('Invalid API key — must start with sk-ant')
      return
    }
    setError('')
    onSave(key)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0b0c0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Mono', 'Courier New', monospace", padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔑</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '3px', color: '#fff', marginBottom: '8px' }}>
          CONNECT YOUR API KEY
        </div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '28px', lineHeight: '1.7' }}>
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
            width: '100%', background: '#111318',
            border: `1px solid ${error ? '#ff2d2d' : '#1e2028'}`,
            borderRadius: '8px', padding: '14px', color: '#e8e6e0',
            fontFamily: 'inherit', fontSize: '14px', marginBottom: '8px', outline: 'none',
          }}
        />
        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '12px', textAlign: 'left' }}>
            {error}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          style={{
            width: '100%', padding: '14px',
            background: key.trim() ? '#ff2d2d' : '#2a2d38',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px',
            letterSpacing: '3px', cursor: key.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          SAVE &amp; CONTINUE
        </button>
        <div style={{ marginTop: '16px', fontSize: '11px', color: '#333' }}>
          Get your key at console.anthropic.com
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/components/ApiKeySetup.test.jsx
```

Expected: PASS — 4 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/ApiKeySetup.jsx src/components/ApiKeySetup.test.jsx
git commit -m "feat: add ApiKeySetup onboarding component"
```

---

### Task 7: Create components/BugInput.jsx

**Files:**
- Create: `src/components/BugInput.jsx`
- Create: `src/components/BugInput.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/BugInput.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BugInput from './BugInput'

describe('BugInput', () => {
  it('renders textarea and generate button', () => {
    render(<BugInput onGenerate={vi.fn()} loading={false} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
  })

  it('generate button disabled when textarea is empty', () => {
    render(<BugInput onGenerate={vi.fn()} loading={false} />)
    expect(screen.getByRole('button', { name: /generate/i })).toBeDisabled()
  })

  it('generate button enabled when textarea has text', () => {
    render(<BugInput onGenerate={vi.fn()} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'login broken' } })
    expect(screen.getByRole('button', { name: /generate/i })).not.toBeDisabled()
  })

  it('calls onGenerate with input text on click', () => {
    const onGenerate = vi.fn()
    render(<BugInput onGenerate={onGenerate} loading={false} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'login broken' } })
    fireEvent.click(screen.getByRole('button', { name: /generate/i }))
    expect(onGenerate).toHaveBeenCalledWith('login broken')
  })

  it('disables input and button while loading', () => {
    render(<BugInput onGenerate={vi.fn()} loading={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/components/BugInput.test.jsx
```

Expected: FAIL — `Cannot find module './BugInput'`

- [ ] **Step 3: Create src/components/BugInput.jsx**

```jsx
import { useState } from 'react'

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
      <label style={{ display: 'block', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>
        Describe the bug (messy is fine)
      </label>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        disabled={loading}
        placeholder={`e.g. "the login button doesn't work on mobile after password reset..."`}
        style={{
          width: '100%', minHeight: '140px', background: '#111318',
          border: '1px solid #1e2028', borderRadius: '10px', padding: '18px',
          color: '#e8e6e0', fontFamily: "'DM Mono', monospace", fontSize: '14px',
          resize: 'vertical', outline: 'none', lineHeight: '1.7',
        }}
      />
      <button
        onClick={() => input.trim() && onGenerate(input)}
        disabled={loading || !input.trim()}
        style={{
          marginTop: '16px', width: '100%', padding: '16px', background: '#ff2d2d',
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

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/components/BugInput.test.jsx
```

Expected: PASS — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/BugInput.jsx src/components/BugInput.test.jsx
git commit -m "feat: extract BugInput component"
```

---

### Task 8: Create components/ExportMenu.jsx

**Files:**
- Create: `src/components/ExportMenu.jsx`
- Create: `src/components/ExportMenu.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/ExportMenu.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ExportMenu from './ExportMenu'

const REPORT = {
  title: 'Login broken', environment: { browser: 'Chrome', device: 'Mobile', os: 'iOS' },
  steps: ['Open app'], expected: 'Logged in', actual: 'Nothing', severity: 'High', tags: ['auth'],
}

describe('ExportMenu', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) }, writable: true,
    })
  })

  it('renders Copy Text and Copy Markdown buttons', () => {
    render(<ExportMenu report={REPORT} />)
    expect(screen.getByRole('button', { name: /copy text/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy markdown/i })).toBeInTheDocument()
  })

  it('Copy Text writes plain text to clipboard', async () => {
    render(<ExportMenu report={REPORT} />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /copy text/i })) })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Login broken'))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.not.stringContaining('##'))
  })

  it('Copy Markdown writes markdown to clipboard', async () => {
    render(<ExportMenu report={REPORT} />)
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /copy markdown/i })) })
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('## 🐛 Login broken'))
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/components/ExportMenu.test.jsx
```

Expected: FAIL — `Cannot find module './ExportMenu'`

- [ ] **Step 3: Create src/components/ExportMenu.jsx**

```jsx
import { useState } from 'react'
import { formatReport } from '../lib/formatReport'

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)

function CopyButton({ label, format, report }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(formatReport(report, format)).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        flex: 1, padding: '13px', background: 'transparent',
        border: `1px solid ${copied ? '#00c48c' : '#2a2d38'}`,
        borderRadius: '10px', color: copied ? '#00c48c' : '#888',
        fontFamily: "'DM Mono', monospace", fontSize: '12px',
        cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: '8px', letterSpacing: '1px', transition: 'all 0.2s',
      }}
    >
      <CopyIcon />
      {copied ? 'COPIED!' : label}
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

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/components/ExportMenu.test.jsx
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExportMenu.jsx src/components/ExportMenu.test.jsx
git commit -m "feat: add ExportMenu with text and markdown copy"
```

---

### Task 9: Create components/ReportCard.jsx

**Files:**
- Create: `src/components/ReportCard.jsx`
- Create: `src/components/ReportCard.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/ReportCard.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ReportCard from './ReportCard'

const REPORT = {
  title: 'Login button broken on mobile',
  environment: { browser: 'Safari', device: 'Mobile', os: 'iOS 17' },
  steps: ['Open app', 'Tap login button'],
  expected: 'User is logged in', actual: 'Nothing happens',
  severity: 'Critical', tags: ['auth', 'mobile'],
}

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn().mockResolvedValue(undefined) }, writable: true,
  })
})

describe('ReportCard', () => {
  it('renders the report title', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByText('Login button broken on mobile')).toBeInTheDocument()
  })
  it('renders the severity badge', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByText('Critical')).toBeInTheDocument()
  })
  it('renders all environment values', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByText('Safari')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('iOS 17')).toBeInTheDocument()
  })
  it('renders all steps', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByText('Open app')).toBeInTheDocument()
    expect(screen.getByText('Tap login button')).toBeInTheDocument()
  })
  it('renders expected and actual behavior', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByText('User is logged in')).toBeInTheDocument()
    expect(screen.getByText('Nothing happens')).toBeInTheDocument()
  })
  it('renders tags with # prefix', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByText('#auth')).toBeInTheDocument()
    expect(screen.getByText('#mobile')).toBeInTheDocument()
  })
  it('renders export buttons', () => {
    render(<ReportCard report={REPORT} />)
    expect(screen.getByRole('button', { name: /copy text/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy markdown/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/components/ReportCard.test.jsx
```

Expected: FAIL — `Cannot find module './ReportCard'`

- [ ] **Step 3: Create src/components/ReportCard.jsx**

```jsx
import ExportMenu from './ExportMenu'

const SEVERITY_COLORS = {
  Critical: { bg: '#ff2d2d', text: '#fff' },
  High:     { bg: '#ff6b00', text: '#fff' },
  Medium:   { bg: '#f5c400', text: '#1a1a1a' },
  Low:      { bg: '#00c48c', text: '#fff' },
}

const sectionLabel = { fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#ff2d2d', marginBottom: '10px' }

export default function ReportCard({ report }) {
  const severityColor = SEVERITY_COLORS[report.severity] ?? { bg: '#333', text: '#fff' }

  return (
    <div style={{ marginTop: '40px', background: '#111318', border: '1px solid #1e2028', borderRadius: '14px', overflow: 'hidden', animation: 'slideUp 0.4s ease' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #1e2028', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', background: '#0e1013' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '1.5px', color: '#fff', lineHeight: '1.2', flex: 1 }}>
          {report.title}
        </div>
        <div style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', flexShrink: 0, background: severityColor.bg, color: severityColor.text }}>
          {report.severity}
        </div>
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div style={sectionLabel}>Environment</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {Object.entries(report.environment).map(([k, v]) => (
              <div key={k} style={{ background: '#0b0c0f', border: '1px solid #1e2028', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '10px', color: '#444', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{k}</div>
                <div style={{ fontSize: '13px', color: '#aaa' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={sectionLabel}>Steps to Reproduce</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {report.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '24px', height: '24px', background: '#1e2028', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#ff2d2d', flexShrink: 0, marginTop: '1px' }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[['Expected', report.expected], ['Actual', report.actual]].map(([label, text]) => (
            <div key={label}>
              <div style={sectionLabel}>{label}</div>
              <div style={{ background: '#0b0c0f', border: '1px solid #1e2028', borderRadius: '8px', padding: '14px 16px', fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
                {text}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={sectionLabel}>Tags</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {report.tags.map(tag => (
              <div key={tag} style={{ background: '#1a1c22', border: '1px solid #2a2d38', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', color: '#888', letterSpacing: '0.5px' }}>
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

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/components/ReportCard.test.jsx
```

Expected: PASS — 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/ReportCard.jsx src/components/ReportCard.test.jsx
git commit -m "feat: extract ReportCard component"
```

---

### Task 10: Create components/ReportHistory.jsx

**Files:**
- Create: `src/components/ReportHistory.jsx`
- Create: `src/components/ReportHistory.test.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/components/ReportHistory.test.jsx`:

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ReportHistory from './ReportHistory'

const makeEntry = (id, title, severity = 'Low') => ({
  id, title, severity,
  timestamp: new Date('2026-05-10T12:00:00').getTime(),
  report: { title, environment: {}, steps: [], expected: '', actual: '', severity, tags: [] },
})

describe('ReportHistory', () => {
  it('renders nothing when history is empty', () => {
    const { container } = render(<ReportHistory history={[]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders history item titles', () => {
    const history = [makeEntry('1', 'Login broken', 'Critical'), makeEntry('2', 'Cart bug', 'Medium')]
    render(<ReportHistory history={history} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('Login broken')).toBeInTheDocument()
    expect(screen.getByText('Cart bug')).toBeInTheDocument()
  })

  it('calls onSelect with report when item title is clicked', () => {
    const onSelect = vi.fn()
    const entry = makeEntry('1', 'Login broken', 'High')
    render(<ReportHistory history={[entry]} onSelect={onSelect} onRemove={vi.fn()} onClear={vi.fn()} />)
    fireEvent.click(screen.getByText('Login broken'))
    expect(onSelect).toHaveBeenCalledWith(entry.report)
  })

  it('calls onRemove with id when delete button clicked', () => {
    const onRemove = vi.fn()
    render(<ReportHistory history={[makeEntry('1', 'Login broken')]} onSelect={vi.fn()} onRemove={onRemove} onClear={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(onRemove).toHaveBeenCalledWith('1')
  })

  it('calls onClear when clear all is clicked', () => {
    const onClear = vi.fn()
    render(<ReportHistory history={[makeEntry('1', 'Login broken')]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('hides items when collapsed and shows them when expanded', () => {
    render(<ReportHistory history={[makeEntry('1', 'Login broken')]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('Login broken')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /collapse/i }))
    expect(screen.queryByText('Login broken')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /expand/i }))
    expect(screen.getByText('Login broken')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test -- --run src/components/ReportHistory.test.jsx
```

Expected: FAIL — `Cannot find module './ReportHistory'`

- [ ] **Step 3: Create src/components/ReportHistory.jsx**

```jsx
import { useState } from 'react'

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
    <div style={{ marginTop: '24px', background: '#0b0c0f', border: '1px solid #1e2028', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: collapsed ? 'none' : '1px solid #1e2028' }}>
        <div style={{ fontSize: '10px', letterSpacing: '2px', color: '#555', textTransform: 'uppercase', fontFamily: "'DM Mono', monospace" }}>
          Recent Reports ({history.length})
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={onClear} aria-label="clear all" style={{ background: 'none', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
            Clear all
          </button>
          <button onClick={() => setCollapsed(c => !c)} aria-label={collapsed ? 'expand' : 'collapse'} style={{ background: 'none', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer' }}>
            {collapsed ? '▼' : '▲'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px 20px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.map(entry => (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#111318', border: '1px solid #1e2028', borderRadius: '8px', padding: '10px 12px' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelect(entry.report)}>
                <div style={{ fontSize: '10px', color: SEVERITY_COLORS[entry.severity] ?? '#888', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
                  {entry.severity}
                </div>
                <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4' }}>{entry.title}</div>
                <div style={{ fontSize: '10px', color: '#444', marginTop: '4px' }}>{formatDate(entry.timestamp)}</div>
              </div>
              <button onClick={() => onRemove(entry.id)} aria-label="delete" style={{ background: 'none', border: 'none', color: '#333', fontSize: '14px', cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>
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

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/components/ReportHistory.test.jsx
```

Expected: PASS — 6 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/ReportHistory.jsx src/components/ReportHistory.test.jsx
git commit -m "feat: add ReportHistory collapsible bottom drawer"
```

---

### Task 11: Refactor App.jsx and clean up

**Files:**
- Modify: `src/App.jsx`
- Modify: `.env`

- [ ] **Step 1: Replace App.jsx entirely**

Replace `src/App.jsx` with:

```jsx
import { useState } from 'react'
import { generateReport } from './lib/generateReport'
import { useApiKey } from './hooks/useApiKey'
import { useReportHistory } from './hooks/useReportHistory'
import ApiKeySetup from './components/ApiKeySetup'
import BugInput from './components/BugInput'
import ReportCard from './components/ReportCard'
import ReportHistory from './components/ReportHistory'

const BugIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/>
    <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
  </svg>
)

export default function App() {
  const { apiKey, setApiKey, clearApiKey } = useApiKey()
  const { history, addReport, removeReport, clearHistory } = useReportHistory()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!apiKey) return <ApiKeySetup onSave={setApiKey} />

  async function handleGenerate(inputText) {
    setLoading(true)
    setError('')
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
      setError(err.message === 'INVALID_KEY'
        ? 'Invalid API key. Please update it.'
        : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0c0f', fontFamily: "'DM Mono', 'Courier New', monospace", color: '#e8e6e0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
        @media (max-width: 600px) {
          .hero-header { padding: 24px 20px !important; }
          .app-title { font-size: 32px !important; }
          .main-content { padding: 32px 16px !important; }
        }
      `}</style>

      <div className="hero-header" style={{ background: 'linear-gradient(135deg, #0b0c0f 0%, #111318 100%)', borderBottom: '1px solid #1e2028', padding: '36px 40px 32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '52px', height: '52px', background: '#ff2d2d', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(255,45,45,0.4)' }}>
          <BugIcon />
        </div>
        <div>
          <div className="app-title" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '3px', color: '#fff', lineHeight: 1 }}>BugSnap</div>
          <div style={{ fontSize: '12px', color: '#555', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>AI-Powered Bug Report Generator</div>
        </div>
        <button onClick={clearApiKey} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#333', fontSize: '11px', cursor: 'pointer', fontFamily: "'DM Mono', monospace", letterSpacing: '1px' }}>
          Update API key
        </button>
      </div>

      <div className="main-content" style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px' }}>
        <BugInput onGenerate={handleGenerate} loading={loading} />

        {error && (
          <div style={{ marginTop: '16px', padding: '14px 18px', background: 'rgba(255,45,45,0.06)', border: '1px solid rgba(255,45,45,0.2)', borderRadius: '8px', fontSize: '13px', color: '#ff6b6b' }}>
            {error}
            {error.includes('Invalid API key') && (
              <button onClick={clearApiKey} style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ff2d2d', cursor: 'pointer', fontFamily: "'DM Mono', monospace", fontSize: '13px', textDecoration: 'underline' }}>
                Update it
              </button>
            )}
          </div>
        )}

        {report && <ReportCard report={report} />}

        <ReportHistory history={history} onSelect={r => { setReport(r); setError('') }} onRemove={removeReport} onClear={clearHistory} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update .env**

Replace `.env` contents with:

```
# API key is now entered by the user on first visit and stored in localStorage.
# VITE_ANTHROPIC_API_KEY is no longer used — remove it if present.
```

- [ ] **Step 3: Run full test suite**

```bash
npm test -- --run
```

Expected: All tests pass. Minimum 41 tests across all files.

- [ ] **Step 4: Start dev server and verify end-to-end**

```bash
npm run dev
```

Open http://localhost:5173 and manually verify:
- [ ] First visit shows ApiKeySetup fullscreen
- [ ] A key not starting with `sk-ant` shows the inline error
- [ ] A valid key (`sk-ant-...`) saves and shows the main app
- [ ] Typing a bug description enables the Generate button
- [ ] Generating a report calls the API and renders the ReportCard
- [ ] Report history drawer appears below the card after first report
- [ ] Copy Text copies plain text to clipboard
- [ ] Copy Markdown copies markdown to clipboard
- [ ] Clicking a history item reloads that report into ReportCard
- [ ] Delete (✕) removes a single history entry
- [ ] Clear all empties the history drawer (drawer disappears)
- [ ] Collapse/expand the drawer works
- [ ] "Update API key" in header re-shows the setup screen
- [ ] Refreshing the page preserves both API key and history

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx .env
git commit -m "feat: refactor App to thin orchestrator, wire all components"
```
