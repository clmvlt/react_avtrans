import { useQuery } from '@tanstack/react-query'
import type { NotificationPreferencesDTO } from '@/models'
import { usersService } from '@/services'
import { profileKeys } from './queryKeys'

async function fetchMyNotificationPreferences(): Promise<NotificationPreferencesDTO | null> {
  try {
    // DTO nu (pas de clé `data`)
    return (await usersService.getMyNotificationPreferences()) ?? null
  } catch (err) {
    // Comme le Vue : échec seulement journalisé, les préférences restent « Notification »
    // (erreur avalée, bug B-31)
    console.error('Error loading notification preferences:', err)
    return null
  }
}

/**
 * Préférences de notification (GET /users/me/notification-preferences), chargées seulement si
 * le profil ne les contient pas (`enabled`), comme le Vue.
 */
export function useMyNotificationPreferencesQuery({ enabled }: { enabled: boolean }) {
  return useQuery({
    queryKey: profileKeys.notificationPreferences(),
    queryFn: fetchMyNotificationPreferences,
    enabled,
    retry: false,
  })
}
