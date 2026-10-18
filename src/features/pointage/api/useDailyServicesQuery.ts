import { useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive } from '@/lib/liveCounter'
import { userServicesService } from '@/services'
import { toDailyWorkday } from '../lib/dailyWorkday'
import { pointageKeys } from './queryKeys'

/**
 * Journée de travail en cours de l'utilisateur connecté (GET /services/user/daily) : aujourd'hui,
 * ou la veille pour un service de nuit tant qu'aucun service n'a commencé aujourd'hui ; ses
 * services avec leurs pauses et son temps net. Rechargée après chaque action de pointage, au
 * retour sur l'onglet, toutes les 5 minutes et au changement de jour.
 */
export function useDailyServicesQuery() {
  return useQuery({
    queryKey: pointageKeys.daily(),
    queryFn: () => receive(userServicesService.getDailyServices()),
    select: toDailyWorkday,
    ...liveQueryOptions,
  })
}
