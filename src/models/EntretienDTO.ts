import type { TypeEntretienDTO } from './TypeEntretienDTO';
import type { UserDTO } from './UserDTO';
import type { VehiculeDTO } from './VehiculeDTO';

/**
 * Entretien effectué sur un véhicule
 */
export interface EntretienDTO {
  /** Identifiant unique de l'entretien */
  id?: string;
  /** Identifiant du véhicule */
  vehiculeId?: string;
  /** Immatriculation du véhicule */
  vehiculeImmat?: string;
  /** Type d'entretien générique */
  typeEntretien?: TypeEntretienDTO;
  /** Mécanicien ayant effectué l'entretien */
  mecanicien?: UserDTO;
  /** Date de l'entretien */
  dateEntretien?: Date | string;
  /** Kilométrage au moment de l'entretien */
  kilometrage?: number;
  /** Commentaire sur l'entretien */
  commentaire?: string;
  /** Coût de l'entretien en euros */
  cout?: number;
  /** Date de création de l'enregistrement */
  createdAt?: Date | string;
}

/**
 * Requête de création d'un entretien
 */
export interface EntretienCreateRequest {
  /** Identifiant du véhicule */
  vehiculeId: string;
  /** Identifiant du type d'entretien */
  typeEntretienId: string;
  /** Date de l'entretien */
  dateEntretien: Date | string;
  /** Kilométrage au moment de l'entretien */
  kilometrage: number;
  /** Commentaire sur l'entretien */
  commentaire?: string;
  /** Coût de l'entretien en euros */
  cout?: number;
  /** Fichiers à joindre (PDF, images, etc.) */
  files?: EntretienFileUploadRequest[];
}

/**
 * Requête de mise à jour d'un entretien
 */
export interface EntretienUpdateRequest {
  /** Identifiant du type d'entretien */
  typeEntretienId?: string;
  /** Date de l'entretien */
  dateEntretien?: Date | string;
  /** Kilométrage au moment de l'entretien */
  kilometrage?: number;
  /** Commentaire sur l'entretien */
  commentaire?: string;
  /** Coût de l'entretien en euros */
  cout?: number;
}

/**
 * Photo d'un entretien (legacy - utilisez EntretienFileDTO)
 */
export interface EntretienPictureDTO {
  /** Identifiant unique de la photo */
  id?: string;
  /** Identifiant de l'entretien */
  entretienId?: string;
  /** Photo encodée en base64 */
  pictureB64?: string;
  /** Date d'ajout de la photo */
  createdAt?: Date | string;
}

/**
 * Fichier d'un entretien (PDF, image, document)
 */
export interface EntretienFileDTO {
  /** Identifiant unique du fichier */
  id?: string;
  /** Identifiant de l'entretien */
  entretienId?: string;
  /** Contenu du fichier encodé en base64 */
  fileB64?: string;
  /** Nom original du fichier */
  originalName?: string;
  /** Type MIME du fichier */
  mimeType?: string;
  /** Taille du fichier en octets */
  fileSize?: number;
  /** Date d'ajout du fichier */
  createdAt?: Date | string;
}

/**
 * Requête d'upload de fichier pour entretien
 */
export interface EntretienFileUploadRequest {
  /** Contenu du fichier encodé en base64 */
  fileB64: string;
  /** Nom original du fichier */
  originalName: string;
  /** Type MIME du fichier */
  mimeType: string;
}

/**
 * Requête de recherche d'historique des entretiens avec pagination et filtres
 */
export interface EntretienHistoryRequest {
  /** Numéro de page (commence à 0) */
  page?: number;
  /** Nombre d'éléments par page */
  size?: number;
  /** Champ de tri (dateEntretien, kilometrage, cout) */
  sortBy?: string;
  /** Direction du tri (asc ou desc) */
  sortDirection?: string;
  /** Date de début de recherche */
  startDate?: string;
  /** Date de fin de recherche */
  endDate?: string;
  /** Filtrer par véhicule (UUID) */
  vehiculeId?: string;
  /** Filtrer par type d'entretien (UUID) */
  typeEntretienId?: string;
  /** Filtrer par mécanicien (UUID) */
  mecanicienId?: string;
  /** Kilométrage minimum */
  kmMin?: number;
  /** Kilométrage maximum */
  kmMax?: number;
  /** Coût minimum */
  coutMin?: number;
  /** Coût maximum */
  coutMax?: number;
}

/**
 * Prochain entretien à effectuer
 * Correspond à la réponse de GET /entretiens/vehicule/{vehiculeId}/prochains-entretiens
 */
export interface ProchainEntretienDTO {
  vehicule?: VehiculeDTO;
  typeEntretien?: TypeEntretienDTO;
  /** Dernier entretien effectué */
  dernierEntretien?: EntretienDTO;
  /** Kilométrage prévu du prochain entretien */
  prochainKilometrage?: number;
  /** Date prévue du prochain entretien (pour entretiens temporels) */
  prochaineDateTemporelle?: Date | string;
  /** Nombre de km restants avant l'entretien */
  kmRestants?: number;
  /** Nombre de jours restants avant l'entretien */
  joursRestants?: number;
  /** Indique si l'entretien est en retard */
  enRetard?: boolean;
  /** Message descriptif */
  message?: string;
}

/**
 * Véhicule avec ses prochains entretiens à effectuer (par km et par date)
 * Correspond à la réponse de GET /entretiens/vehicules-prochains-entretiens
 * et GET /entretiens/vehicule/{vehiculeId}/prochains-entretiens
 */
export interface VehiculeProchainEntretienDTO {
  vehicule?: VehiculeDTO;
  /** Prochain entretien basé sur le kilométrage */
  prochainEntretienKm?: ProchainEntretienDTO;
  /** Prochain entretien basé sur la date */
  prochainEntretienDate?: ProchainEntretienDTO;
}
