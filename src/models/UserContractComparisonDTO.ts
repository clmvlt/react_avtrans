import type { UserDTO } from './UserDTO'

/**
 * DTO de comparaison heures contrat vs heures effectuées
 */
export interface UserContractComparisonDTO {
  user: UserDTO
  year: number
  month: number
  /** Heures du contrat (null si non défini) */
  heureContrat: number | null
  /** Heures réellement travaillées */
  heuresEffectuees: number
  /** Différence effectuées - contrat (null si pas de contrat) */
  difference: number | null
  /** (effectuées/contrat)*100 (null si pas de contrat) */
  pourcentageRealisation: number | null
  /** Jours d'absence approuvés (0.5 pour demi-journée) */
  joursAbsence: number
  /** Jours lun-ven du mois */
  joursOuvres: number
  /** Jours avec au moins un pointage */
  joursTravailles: number
  /** effectuées / joursTravailles */
  moyenneHeuresParJour: number | null
}

/**
 * Réponse API pour un seul utilisateur
 */
export interface UserContractComparisonResponse {
  success: boolean
  message: string
  data: UserContractComparisonDTO
}

/**
 * Réponse API pour tous les utilisateurs
 */
export interface UsersContractComparisonListResponse {
  success: boolean
  message: string
  year: number
  month: number
  users: UserContractComparisonDTO[]
}
