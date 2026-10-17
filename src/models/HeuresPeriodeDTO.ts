/**
 * Temps de travail net d'une période (pauses déduites), calculé par l'API à l'instant `calculeLe`
 * de la réponse — D12.
 *
 * Un service compte en entier (pauses comprises) sur la période de son jour de début, même s'il
 * se termine le lendemain.
 */
export interface HeuresPeriodeDTO {
  /** Temps de travail net en secondes */
  secondes: number;
  /** Même valeur en heures décimales, arrondie au centième */
  heures: number;
  /** Un service de la période est en cours hors pause : le compteur avance d'une seconde par seconde */
  enCours: boolean;
}
