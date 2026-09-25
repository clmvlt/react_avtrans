/**
 * DTO représentant un véhicule avec ses informations de base et le kilométrage le plus récent
 */
export interface VehiculeDTO {
  /** Identifiant unique du véhicule */
  id?: string;
  /** Immatriculation du véhicule */
  immat?: string;
  /** Immatriculation du véhicule relais (le cas échéant) */
  relaiImmat?: string;
  /** Date de création du véhicule */
  createdAt?: Date | string;
  /** Modèle du véhicule */
  model?: string;
  /** Marque du véhicule */
  brand?: string;
  /** Commentaire optionnel */
  comment?: string;
  /** Kilométrage le plus récent enregistré */
  latestKm?: number;
  /** Date du kilométrage le plus récent */
  latestKmDate?: Date | string;
  /** URL de la photo de profil du véhicule */
  pictureUrl?: string;
  /** Numéro de série / VIN (17 caractères max) */
  vin?: string;
  /** N° certificat d'immatriculation */
  numeroCarteGrise?: string;
  /** Date de première mise en circulation (YYYY-MM-DD) */
  dateMiseEnCirculation?: string;
  /** Type de carburant (Diesel, Essence, Électrique, Hybride, GNV) */
  typeCarburant?: string;
  /** Poids Total Autorisé en Charge (kg) */
  ptac?: number;
  /** N° contrat d'assurance */
  numeroContratAssurance?: string;
  /** Compagnie d'assurance */
  assureur?: string;
  /** Date d'expiration de l'assurance (YYYY-MM-DD) */
  dateExpirationAssurance?: string;
  /** Date du prochain contrôle technique (YYYY-MM-DD) */
  dateProchainControleTechnique?: string;
}

/**
 * Requête pour créer un nouveau véhicule
 */
export interface VehiculeCreateRequest {
  /** Immatriculation du véhicule */
  immat?: string;
  /** Immatriculation du véhicule relais (le cas échéant) */
  relaiImmat?: string;
  /** Modèle du véhicule */
  model?: string;
  /** Marque du véhicule */
  brand?: string;
  /** Commentaire optionnel */
  comment?: string;
  /** Photo de profil en base64 */
  pictureBase64?: string;
  vin?: string;
  numeroCarteGrise?: string;
  dateMiseEnCirculation?: string;
  typeCarburant?: string;
  ptac?: number;
  numeroContratAssurance?: string;
  assureur?: string;
  dateExpirationAssurance?: string;
  dateProchainControleTechnique?: string;
}

/**
 * Requête pour modifier un véhicule existant
 */
export interface VehiculeUpdateRequest {
  /** Immatriculation du véhicule */
  immat?: string;
  /** Immatriculation du véhicule relais (le cas échéant) */
  relaiImmat?: string;
  /** Modèle du véhicule */
  model?: string;
  /** Marque du véhicule */
  brand?: string;
  /** Commentaire optionnel */
  comment?: string;
  /** Photo de profil en base64 */
  pictureBase64?: string;
  vin?: string;
  numeroCarteGrise?: string;
  dateMiseEnCirculation?: string;
  typeCarburant?: string;
  ptac?: number;
  numeroContratAssurance?: string;
  assureur?: string;
  dateExpirationAssurance?: string;
  dateProchainControleTechnique?: string;
}
