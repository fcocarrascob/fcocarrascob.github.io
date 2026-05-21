import { useState, useCallback } from 'react'

/**
 * A React hook that syncs state with localStorage.
 * Falls back to defaultValue if key is not found or parsing fails.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // storage quota exceeded — ignore silently
      }
      return next
    })
  }, [key])

  return [state, setStoredValue]
}
