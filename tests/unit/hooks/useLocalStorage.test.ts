import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  test('returns initial value when nothing stored', () => {
    const { result } = renderHook(() => useLocalStorage('key1', 'default'))
    expect(result.current[0]).toBe('default')
  })

  test('updates the value and persists to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('key2', 0))
    act(() => result.current[1](42))
    expect(result.current[0]).toBe(42)
    expect(JSON.parse(window.localStorage.getItem('key2')!)).toBe(42)
  })

  test('reads an existing value from localStorage on init', () => {
    window.localStorage.setItem('key3', JSON.stringify({ x: 1 }))
    const { result } = renderHook(() => useLocalStorage('key3', {}))
    expect(result.current[0]).toEqual({ x: 1 })
  })

  test('falls back to initial value on invalid JSON', () => {
    window.localStorage.setItem('key4', 'not-json{')
    const { result } = renderHook(() => useLocalStorage('key4', 99))
    expect(result.current[0]).toBe(99)
  })
})
