import { useQueryClient } from '@tanstack/react-query'
import type { NotificationDTO } from '@/models'
import { markNotificationsReadInList } from '../api/notificationListCache'
import { useMarkNotificationReadMutation } from '../api/useMarkNotificationReadMutation'

/**
 * Bouton ✓ « Marquer comme lu » de la page /notifications. Même cache que la cloche : le compteur
 * de la navbar se met à jour. Un échec est seulement journalisé, comme dans le Vue (bug B-31).
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  const markRead = useMarkNotificationReadMutation()

  const markAsRead = async (notification: NotificationDTO) => {
    if (!notification.uuid) return
    try {
      await markRead.mutateAsync(notification.uuid)
      markNotificationsReadInList(queryClient, notification.uuid)
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  return {
    markAsRead,
    /** Notification en cours de marquage (bouton désactivé) */
    markingUuid: markRead.isPending ? markRead.variables : undefined,
  }
}
