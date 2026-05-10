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
