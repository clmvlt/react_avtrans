import type { UserDTO } from './UserDTO';
import type { AbsenceTypeDTO } from './AbsenceTypeDTO';

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
