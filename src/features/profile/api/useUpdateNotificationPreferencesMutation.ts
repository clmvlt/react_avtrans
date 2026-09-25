import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { NotificationPreferencesDTO, UserDTO } from '@/models'
import { usersService } from '@/services'
import type { NotificationPreferencesValues } from '../lib/notificationChannels'
import { profileKeys } from './queryKeys'

/**
 * Enregistre les six préférences (PUT /users/me/notification-preferences). Comme le Vue, les
 * préférences affichées deviennent les valeurs envoyées (pas de nouveau chargement).
 */
export function useUpdateNotificationPreferencesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...profileKeys.notificationPreferences(), 'update'],
    mutationFn: (values: NotificationPreferencesValues) =>
      usersService.updateMyNotificationPreferences(values),
    onSuccess: (_response, values) => {
      queryClient.setQueryData<UserDTO | null>(profileKeys.me(), (profile) =>
        profile ? { ...profile, notificationPreferences: values } : profile,
      )
      queryClient.setQueryData<NotificationPreferencesDTO | null>(
        profileKeys.notificationPreferences(),
        values,
      )
    },
  })
}
