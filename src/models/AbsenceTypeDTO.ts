import type { ModeDecompte } from './AbsenceDecompteDTO';

/**
 * Absence type DTO — matches the API response
 */
export interface AbsenceTypeDTO {
  uuid?: string;
  name?: string;
  color?: string;
  createdAt?: Date | string;
  /** Mode de décompte des jours (jours ouvrables par défaut) — D8 */
  modeDecompte?: ModeDecompte;
  /** L'absence crédite-t-elle des heures ? (faux pour « Sans solde ») — D8 */
  compteHeures?: boolean;
}
