import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services'
import { notificationsKeys } from './queryKeys'

/** Marque toutes les notifications comme lues (PATCH /notifications/read-all). */
export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    // Attendu : le bouton reste « ... » jusqu'à l'arrivée de la liste à jour
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsKeys.all }),
  })
}
