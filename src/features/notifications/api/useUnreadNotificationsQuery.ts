import { useQuery } from '@tanstack/react-query'
import type { NotificationDTO } from '@/models'
import { notificationsService } from '@/services'
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store'
import type { ApiResponse } from '@/types'
import { notificationsKeys } from './queryKeys'

/** Fréquence du polling du Vue */
const POLL_INTERVAL_MS = 5000

/** La liste est sous la clé `notifications` de l'enveloppe (comme dans le Vue). */
function toNotifications(response: ApiResponse<NotificationDTO[]>): NotificationDTO[] {
  return response.notifications ?? []
}

type UseUnreadNotificationsQueryOptions = {
  /**
   * Porte le polling de 5 s. Un seul appelant le demande (useNotificationSideEffects, monté une
   * fois dans AppLayout) : chaque observateur TanStack a sa propre minuterie, deux observateurs
   * « pollants » montés à des instants différents interrogeraient l'API deux fois. Les autres
   * (cloches de la navbar et du menu mobile) lisent le même cache.
   */
  poll?: boolean
}

/**
 * Notifications non lues de l'utilisateur connecté (GET /notifications/unread).
 * Polling suspendu quand l'onglet est masqué (décision Q-NOTIF-POLL ; le Vue continuait).
 */
export function useUnreadNotificationsQuery({
  poll = false,
}: UseUnreadNotificationsQueryOptions = {}) {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return useQuery({
    queryKey: notificationsKeys.unread(),
    queryFn: () => notificationsService.getUnreadNotifications(),
    select: toNotifications,
    enabled: isAuthenticated,
    refetchInterval: poll ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  })
}
