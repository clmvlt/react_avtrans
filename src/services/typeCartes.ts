import { apiClient } from '@/api'
import type { TypeCarteDTO, TypeCarteCreateRequest, TypeCarteUpdateRequest } from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * Type cartes service
 * Handles CRUD operations for card type definitions
 */
export class TypeCartesService {
  /**
   * Get all card types
   * @returns Promise with list of card types
   */
  async getTypeCartes(): Promise<TypeCarteDTO[]> {
    return apiClient.get<TypeCarteDTO[]>('type-cartes')
  }

  /**
   * Get card type by UUID
   * @param uuid - Card type UUID
   * @returns Promise with card type details
   */
  async getTypeCarteById(uuid: string): Promise<TypeCarteDTO> {
    return apiClient.get<TypeCarteDTO>(`type-cartes/${uuid}`)
  }

  /**
   * [ADMIN] Create card type
   * @param data - Card type data
   * @returns Promise with created card type
   */
  async createTypeCarte(data: TypeCarteCreateRequest): Promise<TypeCarteDTO> {
    return apiClient.post<TypeCarteDTO>('type-cartes', data)
  }

  /**
   * [ADMIN] Update card type
   * @param uuid - Card type UUID
   * @param data - Card type data to update
   * @returns Promise with updated card type
   */
  async updateTypeCarte(uuid: string, data: TypeCarteUpdateRequest): Promise<TypeCarteDTO> {
    return apiClient.put<TypeCarteDTO>(`type-cartes/${uuid}`, data)
  }

  /**
   * [ADMIN] Delete card type
   * @param uuid - Card type UUID
   * @returns Promise with success message
   */
  async deleteTypeCarte(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`type-cartes/${uuid}`)
  }
}

/**
 * Singleton instance of TypeCartesService
 */
export const typeCartesService = new TypeCartesService()
