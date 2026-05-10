import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import App from './App'

vi.mock('./lib/generateReport', () => ({
  generateReport: vi.fn(),
}))

import { generateReport } from './lib/generateReport'

const MOCK_REPORT = {
  title: 'Login broken',
  environment: { browser: 'Chrome', device: 'Desktop', os: 'macOS' },
  steps: ['Open app', 'Click login'],
  expected: 'User is logged in',
  actual: 'Nothing happens',
  severity: 'High',
  tags: ['auth'],
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) }, writable: true,
    })
  })

  it('shows ApiKeySetup when no API key is stored', () => {
    render(<App />)
    expect(screen.getByPlaceholderText(/sk-ant/i)).toBeInTheDocument()
  })

  it('shows main app when API key is already stored', () => {
    localStorage.setItem('bugsnap_api_key', 'sk-ant-valid')
    render(<App />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('generates a report and renders ReportCard on success', async () => {
    localStorage.setItem('bugsnap_api_key', 'sk-ant-valid')
    generateReport.mockResolvedValueOnce(MOCK_REPORT)
    render(<App />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'login broken' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /generate/i })) })
    expect(screen.getAllByText('Login broken').length).toBeGreaterThan(0)
  })

  it('shows invalid key error and "Update it" button on INVALID_KEY error', async () => {
    localStorage.setItem('bugsnap_api_key', 'sk-ant-valid')
    generateReport.mockRejectedValueOnce(new Error('INVALID_KEY'))
    render(<App />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'some bug' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /generate/i })) })
    expect(screen.getByText(/invalid api key/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /update it/i })).toBeInTheDocument()
  })

  it('shows generic error without "Update it" button on other errors', async () => {
    localStorage.setItem('bugsnap_api_key', 'sk-ant-valid')
    generateReport.mockRejectedValueOnce(new Error('NETWORK_ERROR'))
    render(<App />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'some bug' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /generate/i })) })
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /update it/i })).not.toBeInTheDocument()
  })
})
