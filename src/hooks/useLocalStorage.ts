import { useSyncExternalStore } from 'react'

const EVENT = 'local-storage-change'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

/**
 * Valeur texte d'une clé localStorage, synchronisée entre composants et onglets.
 * Les clés sont celles du Vue (ex. `changelog_last_seen_version`, `notifications_sound_enabled`).
 */
export function useLocalStorage(key: string): [string | null, (value: string | null) => void] {
  const value = useSyncExternalStore(subscribe, () => localStorage.getItem(key))

  const setValue = (next: string | null) => {
    if (next === null) localStorage.removeItem(key)
    else localStorage.setItem(key, next)
    window.dispatchEvent(new Event(EVENT))
  }

  return [value, setValue]
}
