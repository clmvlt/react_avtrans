import { UserStatus } from '../enums'
import type { HeuresPeriodeDTO } from './HeuresPeriodeDTO'
import type { RoleDTO } from './RoleDTO'
import type { ServiceDTO } from './ServiceDTO'

/**
 * Service actif de l'utilisateur (D12) : toujours le service de travail, avec ses pauses,
 * `enPause` et `dureeTravail`
 */
export type ActiveServiceDTO = ServiceDTO

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
  /** Service de travail en cours avec ses pauses (si present ou en pause) */
  activeService?: ActiveServiceDTO | null
  /** Heures travaillees nettes de la journee de travail en cours (la veille pour un service de nuit) */
  hoursToday?: HeuresPeriodeDTO
  /** Jour (`YYYY-MM-DD`) de rattachement de `hoursToday` */
  journee?: string
  /** Instant de calcul (heure serveur) */
  calculeLe?: string
}
