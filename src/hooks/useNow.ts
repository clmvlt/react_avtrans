import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let now = Date.now()
let timer: number | undefined

function subscribe(onTick: () => void) {
  listeners.add(onTick)
  if (timer === undefined) {
    now = Date.now()
    timer = window.setInterval(() => {
      now = Date.now()
      listeners.forEach((listener) => listener())
    }, 1000)
  }
  return () => {
    listeners.delete(onTick)
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
    }
  }
}

const getNow = () => now

/**
 * Horodatage courant (ms) rafraîchi chaque seconde, partagé par tous les composants abonnés
 * (chronomètre du pointage, durée d'un service en cours…). Passer `enabled = false` pour ne pas
 * s'abonner (la valeur reste alors celle du dernier tick connu).
 */
export function useNow(enabled = true): number {
  return useSyncExternalStore(enabled ? subscribe : noopSubscribe, getNow)
}

const noopSubscribe = () => () => {}
