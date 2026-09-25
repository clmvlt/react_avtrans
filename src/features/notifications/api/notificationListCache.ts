import type { QueryClient } from '@tanstack/react-query'
import type { NotificationDTO } from '@/models'
import type { ApiResponse } from '@/types'
import { notificationsKeys } from './queryKeys'

/**
 * Marque « lues » dans le cache de la page /notifications, sans attendre son rechargement (le Vue
 * modifiait l'objet affiché dès la réponse du PATCH). `uuid` absent : toutes les notifications.
 * Les mutations invalident déjà `['notifications']` : la liste et la cloche se rechargent ensuite.
 */
export function markNotificationsReadInList(queryClient: QueryClient, uuid?: string): void {
  queryClient.setQueryData<ApiResponse<NotificationDTO[]>>(notificationsKeys.list(), (response) =>
    response?.notifications
      ? {
          ...response,
          notifications: response.notifications.map((notification) =>
            uuid === undefined || notification.uuid === uuid
              ? { ...notification, isRead: true }
              : notification,
          ),
        }
      : response,
  )
}
