import type { UserDTO } from './UserDTO';

/**
 * Notification DTO
 */
export interface NotificationDTO {
  uuid?: string;
  user?: UserDTO;
  title?: string;
  description?: string;
  createdAt?: Date | string;
  isRead?: boolean;
  /** acompte | absence | user | rapport_vehicule | todo | service_modification — sert à la navigation profonde avec refId */
  refType?: 'acompte' | 'absence' | 'user' | 'rapport_vehicule' | 'todo' | 'service_modification' | string;
  /** UUID de la ressource référencée (pour service_modification : UUID du pointage, éventuellement supprimé) */
  refId?: string;
}

/**
 * Request to create a notification
 */
export interface NotificationCreateRequest {
  /** Notification title */
  title: string;
  /** Notification description */
  description: string;
  /** Reference type (e.g., 'entretien', 'absence', 'acompte') */
  refType?: string;
  /** Reference ID (UUID as string) */
  refId?: string;
}
