/** Clés TanStack Query du profil de l'utilisateur connecté. */
export const profileKeys = {
  all: ['profile'] as const,
  /** Profil (GET /profile, DTO nu) */
  me: () => [...profileKeys.all, 'me'] as const,
  /** Préférences de notification (GET /users/me/notification-preferences, DTO nu) */
  notificationPreferences: () => [...profileKeys.all, 'notification-preferences'] as const,
}
