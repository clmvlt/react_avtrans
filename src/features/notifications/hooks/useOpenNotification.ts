import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useServiceHistory } from '@/features/service-history/hooks/useServiceHistory'
import type { NotificationDTO } from '@/models'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'
import { markNotificationsReadInList } from '../api/notificationListCache'
import { useMarkNotificationReadMutation } from '../api/useMarkNotificationReadMutation'
import { getNotificationDestination } from '../lib/notificationMeta'

/**
 * Clic sur une notification de la page /notifications : la marque lue si besoin, puis mène à sa
 * destination (route ou historique d'un pointage pour un admin). Comme le Vue :
 * - sans destination propre (type inconnu, `rapport_vehicule`, historique pour un non-admin),
 *   rien d'autre ne se passe ;
 * - absence et acompte mènent aux pages admin, même pour un simple utilisateur (bug B-08) ;
 * - un échec du marquage est seulement journalisé et annule la navigation (bug B-31).
 */
export function useOpenNotification() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = useAuthStore(selectIsAdmin)
  const { open: openServiceHistory } = useServiceHistory()
  const markRead = useMarkNotificationReadMutation()

  const openNotification = async (notification: NotificationDTO) => {
    // Pas de second PATCH sur un double clic
    if (markRead.isPending) return
    try {
      if (!notification.isRead && notification.uuid) {
        await markRead.mutateAsync(notification.uuid)
        markNotificationsReadInList(queryClient, notification.uuid)
      }

      const destination = getNotificationDestination(notification, isAdmin)
      if (destination?.kind === 'route') {
        navigate(destination.to)
      } else if (destination?.kind === 'service-history') {
        openServiceHistory(destination.serviceUuid)
      }
    } catch (err) {
      console.error('Error handling notification click:', err)
    }
  }

  return openNotification
}
