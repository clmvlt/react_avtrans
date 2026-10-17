import { elapsedSecondsSince } from '@/lib/liveCounter'
import { useMonotonicNow } from './useNow'

/**
 * Secondes écoulées depuis la réception d'une réponse (`Received.receivedAt`), rafraîchies chaque
 * seconde. L'horloge partagée ne tourne que si `advancing` (au moins un compteur avance) ; sinon 0.
 */
export function useLiveElapsed(receivedAt: number | undefined, advancing: boolean): number {
  const active = advancing && receivedAt !== undefined
  const now = useMonotonicNow(active)
  return active ? elapsedSecondsSince(receivedAt, now) : 0
}
