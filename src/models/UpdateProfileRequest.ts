import type { AddressDTO } from './AddressDTO';

/**
 * Update profile request
 */
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  /** Mis en minuscules côté serveur ; 400 "Email already exists: <email>" si pris */
  email?: string;
  /**
   * Photo en Base64 (data URI ou base64 brut).
   * "" (chaîne vide) = SUPPRIMER la photo ; undefined/null = ne pas toucher.
   */
  picture?: string;
  /** Si présent, REMPLACE les 4 champs (un champ omis devient null) */
  address?: AddressDTO;
  /** Numéro de permis de conduire */
  driverLicenseNumber?: string;
}
