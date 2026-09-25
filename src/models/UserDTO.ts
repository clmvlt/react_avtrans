import type { RoleDTO } from './RoleDTO';
import type { NotificationPreferencesDTO } from './NotificationPreferencesDTO';
import type { AddressDTO } from './AddressDTO';
import { UserStatus } from '../enums';

/**
 * User DTO
 */
export interface UserDTO {
  uuid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isMailVerified?: boolean;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  role?: RoleDTO;
  pictureUrl?: string;
  /** Indique si l'utilisateur a la permission couchette */
  isCouchette?: boolean;
  /**
   * Indique si l'utilisateur apparaît dans les listes admin (services, planning,
   * heures, signatures, véhicules). Jamais null côté API ; si absent (ancienne
   * version d'API), le client doit le considérer comme `true` — utiliser
   * `isUserVisible()` de `@/utils/userVisibility` plutôt que lire le champ.
   * Modifiable uniquement par un Administrateur via PUT /users/{uuid}.
   */
  isVisible?: boolean;
  /** Préférences de notification de l'utilisateur */
  notificationPreferences?: NotificationPreferencesDTO;
  /** Statut de présence de l'utilisateur */
  status?: UserStatus;
  /** Adresse de l'utilisateur */
  address?: AddressDTO;
  /** Numéro de permis de conduire */
  driverLicenseNumber?: string;
  /** Numéro de téléphone personnel (peut être null) */
  telPersonnel?: string | null;
  /** Numéro de téléphone professionnel (peut être null) */
  telPro?: string | null;
  /** Heures mensuelles du contrat */
  heureContrat?: number | null;
}

/**
 * Authenticated User DTO (includes token)
 * Used only in /auth/login and /auth/me responses
 */
export interface AuthUserDTO extends UserDTO {
  token?: string;
  /** Indique si l'utilisateur a la permission couchette (redéclaré pour clarté) */
  isCouchette?: boolean;
}
