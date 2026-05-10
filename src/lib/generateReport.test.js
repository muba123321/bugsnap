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
