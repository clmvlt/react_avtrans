import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let now = Date.now()
let monotonic = performance.now()
let timer: number | undefined

function tick() {
  now = Date.now()
  monotonic = performance.now()
  listeners.forEach((listener) => listener())
}

/** Retour sur l'onglet : le minuteur a pu être ralenti en arrière-plan, on rattrape tout de suite. */
function onVisibilityChange() {
  if (document.visibilityState === 'visible') tick()
}

function subscribe(onTick: () => void) {
  listeners.add(onTick)
  if (timer === undefined) {
    now = Date.now()
    monotonic = performance.now()
    timer = window.setInterval(tick, 1000)
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
  return () => {
    listeners.delete(onTick)
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer)
      timer = undefined
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }
}

const getNow = () => now
const getMonotonicNow = () => monotonic
const noopSubscribe = () => () => {}

/**
 * Horodatage courant (ms) rafraîchi chaque seconde, partagé par tous les composants abonnés
 * (durée d'un pointage, heure affichée…). Passer `enabled = false` pour ne pas s'abonner (la
 * valeur reste alors celle du dernier tick connu).
 */
export function useNow(enabled = true): number {
  return useSyncExternalStore(enabled ? subscribe : noopSubscribe, getNow)
}

/**
 * Même horloge partagée, lue sur `performance.now()` (monotone, insensible aux changements d'heure
 * du PC) : base des compteurs en direct (`useLiveElapsed`).
 */
export function useMonotonicNow(enabled = true): number {
  return useSyncExternalStore(enabled ? subscribe : noopSubscribe, getMonotonicNow)
}
