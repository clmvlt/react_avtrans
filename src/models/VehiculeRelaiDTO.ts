/**
 * Statut d'un relais à la date du jour — D9
 */
export type VehiculeRelaiStatut = 'A_VENIR' | 'EN_COURS' | 'TERMINE';

/**
 * Véhicule relais qui remplace temporairement un véhicule (garage, panne…) — D9.
 * Les relevés km saisis sur le véhicule pendant la période (dates incluses) lui sont rattachés.
 */
export interface VehiculeRelaiDTO {
  id: string;
  /** Véhicule remplacé */
  vehiculeId: string;
  vehiculeImmat?: string;
  /** Immatriculation du véhicule relais */
  immat: string;
  marque?: string | null;
  modele?: string | null;
  /** Premier jour du relais (YYYY-MM-DD) */
  dateDebut: string;
  /** Dernier jour du relais, inclus (YYYY-MM-DD) ; null tant que le véhicule n'est pas revenu */
  dateFin?: string | null;
  /** Kilométrage du relais au départ */
  kmDebut?: number | null;
  /** Kilométrage du relais au retour */
  kmFin?: number | null;
  motif?: string | null;
  commentaire?: string | null;
  statut: VehiculeRelaiStatut;
  /** Dernier relevé saisi pendant le relais */
  latestKm?: number | null;
  latestKmDate?: string | null;
  /** Nombre de relevés saisis pendant le relais */
  nbReleves: number;
  /** (km au retour, sinon dernier relevé) - km au départ ; null si inconnu */
  kmParcourus?: number | null;
  createdAt?: string;
  updatedAt?: string | null;
}

/**
 * Requête de déclaration d'un relais (POST /vehicules-relais) — D9
 */
export interface VehiculeRelaiCreateRequest {
  vehiculeId: string;
  immat: string;
  marque?: string | null;
  modele?: string | null;
  dateDebut: string;
  dateFin?: string | null;
  kmDebut?: number | null;
  kmFin?: number | null;
  motif?: string | null;
  commentaire?: string | null;
}

/**
 * Requête de modification d'un relais (PUT /vehicules-relais/{id}) — D9.
 * Remplacement complet : un champ absent ou null est effacé.
 */
export type VehiculeRelaiUpdateRequest = Omit<VehiculeRelaiCreateRequest, 'vehiculeId'>;
