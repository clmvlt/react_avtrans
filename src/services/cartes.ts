import { apiClient } from '@/api'
import type { CarteDTO, CarteCreateRequest, CarteUpdateRequest, CarteResponse } from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * Cartes service
 * Handles CRUD operations for cards
 */
export class CartesService {
  /**
   * Get all cards
   * @returns Promise with list of cards
   */
  async getCartes(): Promise<CarteDTO[]> {
    return apiClient.get<CarteDTO[]>('cartes')
  }

  /**
   * Get card by UUID
   * @param uuid - Card UUID
   * @returns Promise with card details
   */
  async getCarteById(uuid: string): Promise<CarteDTO> {
    return apiClient.get<CarteDTO>(`cartes/${uuid}`)
  }

  /**
   * [ADMIN] Create card
   * @param data - Card data
   * @returns Promise with created card response
   */
  async createCarte(data: CarteCreateRequest): Promise<CarteResponse> {
    return apiClient.post<CarteResponse>('cartes', data)
  }

  /**
   * [ADMIN] Update card
   * @param uuid - Card UUID
   * @param data - Card data to update
   * @returns Promise with updated card response
   */
  async updateCarte(uuid: string, data: CarteUpdateRequest): Promise<CarteResponse> {
    return apiClient.put<CarteResponse>(`cartes/${uuid}`, data)
  }

  /**
   * [ADMIN] Delete card
   * @param uuid - Card UUID
   * @returns Promise with success message
   */
  async deleteCarte(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`cartes/${uuid}`)
  }

  /**
   * Get cards by type
   * @param typeCarteUuid - Card type UUID
   * @returns Promise with list of cards
   */
  async getCartesByType(typeCarteUuid: string): Promise<CarteDTO[]> {
    return apiClient.get<CarteDTO[]>(`cartes/type/${typeCarteUuid}`)
  }

  /**
   * Get cards by user
   * @param userUuid - User UUID
   * @returns Promise with list of cards
   */
  async getCartesByUser(userUuid: string): Promise<CarteDTO[]> {
    return apiClient.get<CarteDTO[]>(`cartes/user/${userUuid}`)
  }
}

/**
 * Singleton instance of CartesService
 */
export const cartesService = new CartesService()
