import type { UserDTO } from './UserDTO'

/**
 * Couchette DTO - Représente une nuit en couchette
 */
export interface CouchetteDTO {
  /** UUID de la couchette */
  uuid?: string
  /** Date de la couchette (format YYYY-MM-DD) */
  date?: string
  /** Utilisateur ayant la couchette */
  user?: UserDTO
  /** Date de création */
  createdAt?: Date | string
}

/**
 * Requête de création d'une couchette (utilisateur)
 */
export interface CouchetteCreateRequest {
  /** Date de la couchette (optionnel, défaut = aujourd'hui) */
  date?: string
}

/**
 * Requête de création d'une couchette par admin
 */
export interface AdminCouchetteCreateRequest {
  /** UUID de l'utilisateur */
  userUuid?: string
  /** Date de la couchette */
  date?: string
}
