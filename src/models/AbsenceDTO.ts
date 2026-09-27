import type { UserDTO } from './UserDTO';
import type { AbsenceTypeDTO } from './AbsenceTypeDTO';
import type { ModeDecompte } from './AbsenceDecompteDTO';

/**
 * Absence DTO — matches the API AbsenceDTO response
 */
export interface AbsenceDTO {
  uuid?: string;
  user?: UserDTO;
  startDate?: string;
  endDate?: string;
  reason?: string;
  absenceType?: AbsenceTypeDTO;
  customType?: string;
  /** FULL_DAY | MORNING | AFTERNOON */
  period?: string;
  /** PENDING | APPROVED | REJECTED */
  status?: string;
  validatedBy?: UserDTO;
  validatedAt?: Date | string;
  rejectionReason?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  /** Jours décomptés (règle du type, fériés exclus, 0.5 par demi-journée) — D8 */
  joursDecomptes?: number;
  /** Heures créditées retenues (forcées sinon calculées) — D8 */
  heures?: number;
  /** Heures calculées d'après le contrat, le type et les jours fériés — D8 */
  heuresCalculees?: number;
  /** Heures fixées à la main par un administrateur (null = calcul automatique) — D8 */
  heuresForcees?: number | null;
  /** Mode de décompte du type — D8 */
  modeDecompte?: ModeDecompte;
  /** Le type crédite-t-il des heures ? — D8 */
  compteHeures?: boolean;
  /** L'employé a-t-il des heures de contrat renseignées ? (sinon 0 h) — D8 */
  contratRenseigne?: boolean;
}

/**
 * Planning user DTO — matches GET /absences/admin/planning response
 */
export interface PlanningUserDTO {
  uuid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: import('./RoleDTO').RoleDTO;
  pictureUrl?: string;
  /** Indique si l'utilisateur a la permission couchette */
  isCouchette?: boolean;
  absences?: AbsenceDTO[];
}
