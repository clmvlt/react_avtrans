import { UserStatus } from '../enums'
import type { RoleDTO } from './RoleDTO'

/**
 * Service actif de l'utilisateur
 */
export interface ActiveServiceDTO {
  /** UUID du service */
  uuid: string
  /** Date et heure de debut du service */
  debut: string
  /** Date et heure de fin du service (null si en cours) */
  fin: string | null
  /** Duree du service en secondes */
  duree: number
  /** Indique si c'est une pause */
  isBreak: boolean
  /** Latitude de la position */
  latitude: number | null
  /** Longitude de la position */
  longitude: number | null
  /** Indique si le service a ete cree par un admin */
  isAdmin: boolean
  /** UUID de l'utilisateur */
  userUuid: string
}

/**
 * Utilisateur avec son statut de presence actuel
 */
export interface UserWithStatusDTO {
  /** UUID de l'utilisateur */
  uuid?: string
  /** Email de l'utilisateur */
  email?: string
  /** Prenom de l'utilisateur */
  firstName?: string
  /** Nom de l'utilisateur */
  lastName?: string
  /** Role de l'utilisateur */
  role?: RoleDTO
  /** URL de la photo de profil */
  pictureUrl?: string | null
  /** Indique si l'utilisateur a la permission couchette */
  isCouchette?: boolean
  /** Statut de presence : PRESENT (en service), ON_BREAK (en pause), ABSENT (pas de service actif) */
  status?: UserStatus
  /** Service actif (si present ou en pause) */
  activeService?: ActiveServiceDTO | null
  /** Heures travaillees aujourd'hui */
  hoursToday?: number
}
