import { UserRole } from '../enums';

/**
 * Role DTO
 */
export interface RoleDTO {
  uuid?: string;
  nom?: UserRole;
  color?: string;
}
