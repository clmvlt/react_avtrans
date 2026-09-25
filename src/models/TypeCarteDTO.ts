/**
 * Type de carte DTO
 */
export interface TypeCarteDTO {
  uuid?: string
  nom?: string
  description?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * Type de carte create request
 */
export interface TypeCarteCreateRequest {
  nom: string
  description?: string
}

/**
 * Type de carte update request
 */
export interface TypeCarteUpdateRequest {
  nom?: string
  description?: string
}
