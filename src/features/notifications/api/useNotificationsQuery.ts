import { useQuery } from '@tanstack/react-query'
import type { NotificationDTO } from '@/models'
import { notificationsService } from '@/services'
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store'
import type { ApiResponse } from '@/types'
import { notificationsKeys } from './queryKeys'

/** La liste est sous la clé `notifications` de l'enveloppe (comme dans le Vue). */
function toNotifications(response: ApiResponse<NotificationDTO[]>): NotificationDTO[] {
  return response.notifications ?? []
}

/**
 * Toutes les notifications de l'utilisateur connecté (GET /notifications), page /notifications.
 * Chargées à l'arrivée sur la page, sans polling (comme le Vue). Même racine de cache que la
 * cloche : un marquage « lu » invalide les deux listes.
 */
export function useNotificationsQuery() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useQuery({
    queryKey: notificationsKeys.list(),
    queryFn: () => notificationsService.getNotifications(),
    select: toNotifications,
    enabled: isAuthenticated,
  })
}
