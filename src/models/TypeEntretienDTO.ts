import type { DossierTypeEntretienDTO } from './DossierTypeEntretienDTO'

/**
 * Type d'entretien générique
 */
export interface TypeEntretienDTO {
  /** Identifiant unique du type d'entretien */
  id?: string;
  /** Nom du type d'entretien */
  nom?: string;
  /** Description détaillée */
  description?: string;
  /** Dossier (catégorie) du type d'entretien */
  dossier?: DossierTypeEntretienDTO;
  /** Date de création */
  createdAt?: Date | string;
}

/**
 * Requête de création d'un type d'entretien générique
 */
export interface TypeEntretienCreateRequest {
  /** Nom du type d'entretien */
  nom: string;
  /** Description détaillée */
  description?: string;
  /** ID du dossier (catégorie) */
  dossierId?: string;
}

/**
 * Requête de mise à jour d'un type d'entretien générique
 */
export interface TypeEntretienUpdateRequest {
  /** Nom du type d'entretien */
  nom?: string;
  /** Description détaillée */
  description?: string;
  /** ID du dossier (catégorie) */
  dossierId?: string;
}
