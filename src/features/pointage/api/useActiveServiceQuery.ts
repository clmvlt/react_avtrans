import { useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { userServicesService } from '@/services'
import { pointageKeys } from './queryKeys'

type ActiveServiceResponse = { success: boolean; service: ServiceDTO | null }

/** Réponse en cache (avec l'instant de réception), aussi écrite par les actions de pointage. */
export type ActiveServiceCache = Received<ActiveServiceResponse | null>

const toActiveService = ({
  data,
  receivedAt,
}: ActiveServiceCache): Received<ServiceDTO | null> => ({
  data: data?.service || null,
  receivedAt,
})

/**
 * Service de travail en cours de l'utilisateur connecté (GET /services/active), avec ses pauses,
 * `enPause` et `dureeTravail` ; `null` sinon. Pendant une pause, c'est toujours le service (D12).
 */
export function useActiveServiceQuery() {
  return useQuery({
    queryKey: pointageKeys.active(),
    queryFn: () => receive(userServicesService.getCurrentService()),
    select: toActiveService,
    ...liveQueryOptions,
  })
}
