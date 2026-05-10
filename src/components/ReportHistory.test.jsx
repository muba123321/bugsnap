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
