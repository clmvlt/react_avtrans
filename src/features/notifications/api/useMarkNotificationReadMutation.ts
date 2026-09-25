import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService } from '@/services'
import { notificationsKeys } from './queryKeys'

/** Marque une notification comme lue (PATCH /notifications/{uuid}/read). */
export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => notificationsService.markAsRead(uuid),
    // Pas d'attente du rechargement : la navigation qui suit part tout de suite, comme le Vue
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsKeys.all })
    },
  })
}
