import type { UserDTO } from './UserDTO'
import type { TypeCarteDTO } from './TypeCarteDTO'

/**
 * Carte DTO
 */
export interface CarteDTO {
  uuid?: string
  nom?: string
  description?: string
  code?: string
  numero?: string
  userUuid?: string
  user?: UserDTO
  typeCarteUuid?: string
  typeCarte?: TypeCarteDTO
  dateExpiration?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

/**
 * Carte create request
 */
export interface CarteCreateRequest {
  nom: string
  description?: string
  code: string
  numero?: string
  userUuid?: string
  typeCarteUuid: string
  dateExpiration?: string
}

/**
 * Carte update request
 */
export interface CarteUpdateRequest {
  nom?: string
  description?: string
  code?: string
  numero?: string
  userUuid?: string
  typeCarteUuid?: string
  dateExpiration?: string
  clearUser?: boolean
}

/**
 * Carte create/update response
 */
export interface CarteResponse {
  success: boolean
  message: string
  carte: CarteDTO
}
