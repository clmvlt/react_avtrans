import type { NotificationChannel, NotificationPreferencesDTO } from '@/models'

/** Canaux proposés pour chaque type d'événement (même ordre et mêmes libellés que le Vue). */
export const NOTIFICATION_CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: 'SITE', label: 'Notification' },
  { value: 'EMAIL', label: 'Notification et Email' },
  { value: 'NONE', label: 'Aucune notification' },
]

/** Libellé d'un canal ; « Non défini » pour une valeur inconnue. */
export function getNotificationChannelLabel(value?: string): string {
  return (
    NOTIFICATION_CHANNEL_OPTIONS.find((option) => option.value === value)?.label || 'Non défini'
  )
}

export type NotificationPreferenceKey = keyof Required<NotificationPreferencesDTO>

/** Les six préférences de l'API, toujours renseignées (le Vue part de « SITE » pour chacune). */
export type NotificationPreferencesValues = Record<NotificationPreferenceKey, NotificationChannel>

type NotificationPreferenceField = {
  key: NotificationPreferenceKey
  label: string
  hint: string
}

/**
 * Préférences affichées sur /profile, dans l'ordre du Vue. `serviceModification` n'y est plus :
 * l'API ne notifie plus les modifications de pointage (demande du propriétaire, 28/09/2026) ; sa
 * valeur reste envoyée telle quelle.
 */
export const NOTIFICATION_PREFERENCE_FIELDS: NotificationPreferenceField[] = [
  { key: 'acompte', label: 'Acomptes', hint: "Notifications pour les demandes d'acompte" },
  { key: 'absence', label: 'Absences', hint: "Notifications pour les demandes d'absence" },
  {
    key: 'userCreated',
    label: "Création d'utilisateur",
    hint: "Notifications lors de la création d'un nouvel utilisateur",
  },
  {
    key: 'rapportVehicule',
    label: 'Rapports véhicule',
    hint: 'Notifications pour les rapports de véhicule',
  },
  { key: 'todo', label: 'Todos', hint: 'Notifications pour les tâches assignées' },
]

/** Préférences reçues de l'API, « SITE » pour toute valeur absente (comme le Vue). */
export function toNotificationPreferencesValues(
  preferences?: NotificationPreferencesDTO | null,
): NotificationPreferencesValues {
  return {
    acompte: preferences?.acompte || 'SITE',
    absence: preferences?.absence || 'SITE',
    userCreated: preferences?.userCreated || 'SITE',
    rapportVehicule: preferences?.rapportVehicule || 'SITE',
    todo: preferences?.todo || 'SITE',
    serviceModification: preferences?.serviceModification || 'SITE',
  }
}
