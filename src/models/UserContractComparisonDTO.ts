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
  /** Heures créditées par les absences approuvées du mois (0 sans contrat) — D8 */
  heuresAbsences?: number
  /** Heures créditées par les jours fériés chômés du mois — D8 */
  heuresFeries?: number
  /** Jours fériés chômés crédités dans le mois — D8 */
  joursFeries?: number
  /** Effectuées + absences + fériés — D8 */
  heuresTotal?: number
  /** Total - contrat (null si pas de contrat) — D8 */
  differenceTotal?: number | null
  /** (total/contrat)*100 (null si pas de contrat) — D8 */
  pourcentageTotal?: number | null
  /** Jours ouvrés restants d'aujourd'hui inclus (lun.-ven., fériés et absences approuvées déduits, demi-journée = 0,5) ; 0 pour un mois passé — D10 */
  joursOuvresRestants?: number
  /** Heures d'un jour ouvré selon le contrat (hebdo / 5), null sans contrat — D10 */
  heuresParJourContrat?: number | null
  /** Heures encore attendues d'ici la fin du mois (heures pointées aujourd'hui déduites), null sans contrat — D10 */
  heuresRestantesPrevues?: number | null
  /** Total actuel + heures restantes prévues, null sans contrat — D10 */
  heuresPrevisionnelles?: number | null
  /** Prévision - contrat, null sans contrat — D10 */
  differencePrevisionnelle?: number | null
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
  /** Jours ouvrés restants du mois, d'aujourd'hui inclus (lun.-ven., hors fériés) ; 0 pour un mois passé — D10 */
  joursOuvresRestants?: number
}
