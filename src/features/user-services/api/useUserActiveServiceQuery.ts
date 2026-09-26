import { useQuery } from '@tanstack/react-query'
import { userServicesService } from '@/services'
import { toStatusInfo } from '../lib/serviceStatus'
import { adminServicesKeys } from './queryKeys'

/**
 * Pointage en cours d'un employé (GET /services/admin/{uuid}/active), traduit en statut
 * (en service, en pause, absent). En chargement ou en erreur, la page considère l'employé absent,
 * comme le Vue.
 */
export function useUserActiveServiceQuery(userUuid: string) {
  return useQuery({
    queryKey: adminServicesKeys.active(userUuid),
    queryFn: () => userServicesService.getActiveService(userUuid),
    select: toStatusInfo,
    enabled: !!userUuid,
  })
}
