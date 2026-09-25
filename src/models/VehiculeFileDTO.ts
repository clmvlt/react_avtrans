/**
 * DTO représentant un fichier attaché à un véhicule (image, PDF, document, etc.)
 */
export interface VehiculeFileDTO {
  /** Identifiant unique du fichier */
  id?: string
  /** Identifiant du véhicule associé */
  vehiculeId?: string
  /** Contenu du fichier encodé en base64 */
  fileB64?: string
  /** Nom original du fichier */
  originalName?: string
  /** Type MIME du fichier */
  mimeType?: string
  /** Taille du fichier en octets */
  fileSize?: number
  /** Date d'ajout du fichier */
  createdAt?: Date | string
  /** URL du fichier sur le serveur */
  fileUrl?: string
}

/**
 * Requête d'upload de fichier pour véhicule
 */
export interface VehiculeFileUploadRequest {
  /** Contenu du fichier encodé en base64 */
  fileB64: string
  /** Nom original du fichier */
  originalName: string
  /** Type MIME du fichier */
  mimeType: string
}
