import type { UserDTO } from './UserDTO';

/**
 * Type d'action d'un administrateur sur un pointage
 */
export type ServiceModificationAction = 'CREATE' | 'UPDATE' | 'DELETE';

/**
 * Entrée du journal des actions admin sur les pointages
 * (GET /services/admin/{serviceUuid}/modifications, POST /services/admin/modifications).
 *
 * Dates ISO 8601 avec décalage, fuseau Paris. Les valeurs `old*` sont null pour
 * un CREATE, les valeurs `new*` sont null pour un DELETE ; en dehors de ces cas,
 * une fin à null signifie que le pointage était / est en cours.
 */
export interface ServiceModificationDTO {
  uuid: string;
  /** UUID du pointage — il peut avoir été supprimé depuis */
  serviceUuid: string;
  action: ServiceModificationAction;
  /** Employé concerné */
  user: UserDTO;
  /** Administrateur auteur de l'action ; null si son compte a été supprimé */
  modifiedBy: UserDTO | null;
  oldDebut: string | null;
  oldFin: string | null;
  oldIsBreak: boolean | null;
  newDebut: string | null;
  newFin: string | null;
  newIsBreak: boolean | null;
  /** Date de l'action */
  createdAt: string;
}

/**
 * Filtres du journal paginé — body de POST /services/admin/modifications.
 * Tous les champs sont optionnels ; tri : action la plus récente d'abord.
 */
export interface ServiceModificationSearchRequest {
  /** Employé concerné */
  userUuid?: string;
  /** Administrateur auteur de l'action */
  modifiedByUuid?: string;
  action?: ServiceModificationAction;
  /** yyyy-MM-dd — date de l'action, borne incluse */
  startDate?: string;
  /** yyyy-MM-dd — date de l'action, borne incluse */
  endDate?: string;
  /** Numéro de page (0-indexé) */
  page?: number;
  size?: number;
}
