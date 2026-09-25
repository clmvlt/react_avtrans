import type { UserDTO } from './UserDTO';
import type { VehiculeDTO } from './VehiculeDTO';

/**
 * DTO représentant une photo de rapport de véhicule
 */
export interface RapportVehiculePictureDTO {
  /** Identifiant unique de la photo */
  id?: string;
  /** Identifiant du rapport associé */
  rapportVehiculeId?: string;
  /** URL de l'image */
  pictureUrl?: string;
  /** Date de création de la photo */
  createdAt?: Date | string;
}

/**
 * DTO représentant un rapport de véhicule
 */
export interface RapportVehiculeDTO {
  /** Identifiant unique du rapport */
  id?: string;
  user?: UserDTO;
  vehicule?: VehiculeDTO;
  /** Commentaire du rapport */
  commentaire?: string;
  /** Date de création du rapport */
  createdAt?: Date | string;
  /** Liste des photos associées au rapport */
  pictures?: RapportVehiculePictureDTO[];
}

/**
 * Réponse paginée pour les rapports de véhicule
 */
export interface RapportVehiculePageResponse {
  success: boolean;
  message?: string;
  data: RapportVehiculeDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

/**
 * Requête pour créer un nouveau rapport de véhicule
 */
export interface RapportVehiculeCreateRequest {
  /** UUID du véhicule concerné */
  vehiculeId: string;
  /** Commentaire du rapport */
  commentaire?: string;
  /** Liste des images encodées en base64 */
  picturesB64?: string[];
}
