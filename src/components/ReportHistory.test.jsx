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

  it('shows "just now" for timestamps less than 1 minute ago', () => {
    const entry = makeEntry('1', 'Recent bug')
    entry.timestamp = Date.now() - 30000 // 30 seconds ago
    render(<ReportHistory history={[entry]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('just now')).toBeInTheDocument()
  })

  it('shows "Xm ago" for timestamps less than 1 hour ago', () => {
    const entry = makeEntry('1', 'Recent bug')
    entry.timestamp = Date.now() - 5 * 60 * 1000 // 5 minutes ago
    render(<ReportHistory history={[entry]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('5m ago')).toBeInTheDocument()
  })

  it('shows "Xh ago" for timestamps less than 24 hours ago', () => {
    const entry = makeEntry('1', 'Recent bug')
    entry.timestamp = Date.now() - 3 * 60 * 60 * 1000 // 3 hours ago
    render(<ReportHistory history={[entry]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('3h ago')).toBeInTheDocument()
  })

  it('shows localized date for timestamps older than 24 hours', () => {
    const entry = makeEntry('1', 'Old bug')
    entry.timestamp = new Date('2026-01-15').getTime()
    render(<ReportHistory history={[entry]} onSelect={vi.fn()} onRemove={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText(new Date('2026-01-15').toLocaleDateString())).toBeInTheDocument()
  })
})
