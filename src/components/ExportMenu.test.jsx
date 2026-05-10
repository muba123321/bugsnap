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
