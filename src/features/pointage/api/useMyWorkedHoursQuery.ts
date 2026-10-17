import { useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import { userServicesService, type WorkedHoursDTO } from '@/services'
import { pointageKeys } from './queryKeys'

const toWorkedHours = ({ data, receivedAt }: Received<WorkedHoursDTO | null>) => ({
  data: data ?? {},
  receivedAt,
})

/**
 * Heures nettes de l'utilisateur connecté, toutes périodes (GET /services/hours) : chaque période
 * est un `HeuresPeriodeDTO` qui avance en direct s'il est `enCours`.
 */
export function useMyWorkedHoursQuery() {
  return useQuery({
    queryKey: pointageKeys.hours(),
    queryFn: () => receive(userServicesService.getWorkedHours()),
    select: toWorkedHours,
    ...liveQueryOptions,
  })
}
