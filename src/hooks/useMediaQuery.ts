import { useSyncExternalStore } from 'react'

/**
 * Suit une media query CSS (remplace useMediaQuery de @vueuse).
 * Exemple : `useMediaQuery('(max-width: 639px)')` pour le mobile des pages « mes ».
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}
