import { useEffect, useEffectEvent, useSyncExternalStore } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toLocalDateKey } from '@/lib/dates'

const listeners = new Set<() => void>()
let dayKey = toLocalDateKey(new Date())
let timer: number | undefined

/** Délai jusqu'au prochain minuit local, plus une seconde de marge. */
function msUntilNextDay(): number {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return next.getTime() - now.getTime() + 1000
}

function schedule() {
  window.clearTimeout(timer)
  timer = window.setTimeout(check, msUntilNextDay())
}

function check() {
  schedule()
  const key = toLocalDateKey(new Date())
  if (key === dayKey) return
  dayKey = key
  listeners.forEach((listener) => listener())
}

/** Onglet en arrière-plan ou appareil en veille : le minuteur a pu être retardé. */
function onVisibilityChange() {
  if (document.visibilityState === 'visible') check()
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  if (listeners.size === 1) {
    dayKey = toLocalDateKey(new Date())
    schedule()
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0) {
      window.clearTimeout(timer)
      timer = undefined
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }
}

const getDayKey = () => dayKey

/** Jour local `YYYY-MM-DD`, mis à jour à minuit. */
export function useDayKey(): string {
  return useSyncExternalStore(subscribe, getDayKey)
}

/** Appelle `onDayChange` au changement de jour local (minuit, ou retour sur l'onglet après minuit). */
export function useOnDayChange(onDayChange: () => void) {
  const handleDayChange = useEffectEvent(onDayChange)
  useEffect(() => subscribe(() => handleDayChange()), [])
}

/** Recharge les requêtes de `queryKey` au changement de jour (compteurs « Aujourd'hui »…). */
export function useInvalidateOnDayChange(queryKey: QueryKey) {
  const queryClient = useQueryClient()
  useOnDayChange(() => void queryClient.invalidateQueries({ queryKey }))
}
