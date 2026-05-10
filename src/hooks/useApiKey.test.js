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
