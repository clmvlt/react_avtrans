/**
 * DTO représentant une photo de véhicule
 */
export interface VehiculePictureDTO {
  /** Identifiant unique de la photo */
  id?: string;
  /** Identifiant du véhicule associé */
  vehiculeId?: string;
  /** URL de l'image */
  pictureUrl?: string;
  /** Date de création de la photo */
  createdAt?: Date | string;
}
