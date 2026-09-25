/**
 * Dossier (catégorie) de types d'entretien
 */
export interface DossierTypeEntretienDTO {
  /** Identifiant unique du dossier */
  id?: string
  /** Nom du dossier */
  nom?: string
  /** Description du dossier */
  description?: string
  /** Date de création */
  createdAt?: Date | string
}

/**
 * Requête de création d'un dossier de types d'entretien
 */
export interface CreateDossierTypeEntretienRequest {
  /** Nom du dossier */
  nom: string
  /** Description du dossier */
  description?: string
}

/**
 * Requête de mise à jour d'un dossier de types d'entretien
 */
export interface UpdateDossierTypeEntretienRequest {
  /** Nom du dossier */
  nom?: string
  /** Description du dossier */
  description?: string
}

/**
 * Réponse de l'API pour un dossier unique
 */
export interface DossierTypeEntretienResponse {
  success: boolean
  message?: string
  dossier: DossierTypeEntretienDTO
}

/**
 * Réponse de l'API pour la liste des dossiers
 */
export interface DossiersTypeEntretienResponse {
  success: boolean
  dossiers: DossierTypeEntretienDTO[]
}
