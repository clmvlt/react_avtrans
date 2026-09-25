import { useEffect, useState } from 'react'

/** Valeur retardée de `delayMs` après le dernier changement (remplace useDebounceFn de @vueuse). */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
