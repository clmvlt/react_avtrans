import type { UserDTO } from './UserDTO'

/**
 * DTO représentant une information d'ajustement/maintenance
 */
export interface VehiculeAdjustInfoDTO {
  /** Identifiant unique de l'information */
  id?: string;
  /** Identifiant du véhicule */
  vehiculeId?: string;
  /** Utilisateur ayant créé l'information */
  user?: UserDTO;
  /** Commentaire décrivant l'ajustement */
  comment?: string;
  /** Date de création */
  createdAt?: Date | string;
}

/**
 * Réponse paginée pour les informations d'ajustement
 */
export interface VehiculeAdjustInfoPageResponse {
  success: boolean;
  adjustInfos: VehiculeAdjustInfoDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Requête pour créer une information d'ajustement avec photos optionnelles
 */
export interface VehiculeAdjustInfoCreateRequest {
  /** Identifiant du véhicule */
  vehiculeId?: string;
  /** Commentaire décrivant l'ajustement */
  comment?: string;
  /** Liste de photos encodées en base64 (optionnel) */
  picturesB64?: string[];
}

/**
 * DTO représentant une photo d'information d'ajustement
 */
export interface VehiculeAdjustInfoPictureDTO {
  /** Identifiant unique de la photo */
  id?: string;
  /** Identifiant de l'information d'ajustement */
  adjustInfoId?: string;
  /** URL de l'image */
  pictureUrl?: string;
  /** Date de création de la photo */
  createdAt?: Date | string;
}
