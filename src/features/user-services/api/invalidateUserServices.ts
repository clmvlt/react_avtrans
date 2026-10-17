import type { QueryClient } from '@tanstack/react-query'
import { serviceHistoryKeys } from '@/features/service-history/api/queryKeys'
import { adminServicesKeys } from './queryKeys'

/**
 * Après une action sur un pointage (création, modification, suppression, démarrer / terminer) :
 * statut de l'employé, liste de ses pointages, historique des modifications (s'il est ouvert) et,
 * depuis les compteurs en direct (D12), ses heures travaillées (B-26 : elles restaient figées).
 */
export function invalidateUserServices(queryClient: QueryClient, userUuid: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: adminServicesKeys.active(userUuid) }),
    queryClient.invalidateQueries({ queryKey: adminServicesKeys.userServices(userUuid) }),
    queryClient.invalidateQueries({ queryKey: adminServicesKeys.userHours(userUuid) }),
    queryClient.invalidateQueries({ queryKey: serviceHistoryKeys.all }),
  ])
}
