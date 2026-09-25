/**
 * Generic file data interface for use across all file components.
 * Both VehiculeFileDTO and EntretienFileDTO conform to this shape.
 */
export interface FileData {
  id?: string
  fileB64?: string
  mimeType?: string
  fileSize?: number
  fileUrl?: string
  originalName?: string
  createdAt?: Date | string
}
