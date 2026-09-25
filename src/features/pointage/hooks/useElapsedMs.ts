import { useNow } from '@/hooks/useNow'
import type { ServiceDTO } from '@/models'

/**
 * Durée écoulée (ms) depuis le début du service ou de la pause en cours, rafraîchie chaque seconde
 * (tick partagé de `useNow`, actif seulement s'il y a un service en cours) ; 0 sinon.
 */
export function useElapsedMs(activeService: ServiceDTO | null): number {
  const now = useNow(!!activeService)
  if (!activeService?.debut) return 0
  return now - new Date(activeService.debut).getTime()
}
