import type { UserDTO } from '@/models'
import { useMyNotificationPreferencesQuery } from '../api/useMyNotificationPreferencesQuery'
import {
  toNotificationPreferencesValues,
  type NotificationPreferencesValues,
} from '../lib/notificationChannels'

/**
 * Préférences affichées sur /profile : celles du profil, sinon (profil chargé sans préférences)
 * celles de GET /users/me/notification-preferences ; « SITE » pour toute valeur absente ou en
 * attendant, comme le Vue.
 */
export function useNotificationPreferences(
  profile: UserDTO | null | undefined,
): NotificationPreferencesValues {
  const fromProfile = profile?.notificationPreferences
  const preferencesQuery = useMyNotificationPreferencesQuery({
    enabled: profile !== undefined && !fromProfile,
  })

  return toNotificationPreferencesValues(fromProfile ?? preferencesQuery.data)
}
