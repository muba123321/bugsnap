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
