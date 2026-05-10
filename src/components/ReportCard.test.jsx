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
