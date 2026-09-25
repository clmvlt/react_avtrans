/**
 * Types de canaux de notification possibles
 */
export type NotificationChannel = 'SITE' | 'EMAIL' | 'NONE'

/**
 * Préférences de notification de l'utilisateur
 */
export interface NotificationPreferencesDTO {
  /** Canal de notification pour les acomptes */
  acompte?: NotificationChannel
  /** Canal de notification pour les absences */
  absence?: NotificationChannel
  /** Canal de notification pour la création d'utilisateur */
  userCreated?: NotificationChannel
  /** Canal de notification pour les rapports de véhicule */
  rapportVehicule?: NotificationChannel
  /** Canal de notification pour les todos */
  todo?: NotificationChannel
  /** Canal de notification quand un autre admin ajoute / modifie / supprime un pointage (admins uniquement, défaut SITE) */
  serviceModification?: NotificationChannel
}

/**
 * Request pour mettre à jour les préférences de notification
 */
export interface UpdateNotificationPreferencesRequest {
  acompte?: NotificationChannel
  absence?: NotificationChannel
  userCreated?: NotificationChannel
  rapportVehicule?: NotificationChannel
  todo?: NotificationChannel
  serviceModification?: NotificationChannel
}
