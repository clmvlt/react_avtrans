import { apiClient } from '@/api'
import type { TypeEntretienDTO } from '@/models'
import type { SuccessMessageResponse, ApiResponse } from '@/types'

/**
 * Maintenance type create request
 */
export interface TypeEntretienCreateRequest {
  nom: string
  description?: string
  dossierId?: string
}

/**
 * Maintenance type update request
 */
export interface TypeEntretienUpdateRequest {
  nom?: string
  description?: string
  dossierId?: string
}

/**
 * Maintenance types service
 * Handles CRUD operations for maintenance type definitions
 */
export class TypesEntretienService {
  /**
   * Get all maintenance types
   * @returns Promise with list of maintenance types
   */
  async getTypesEntretien(): Promise<ApiResponse<TypeEntretienDTO[]>> {
    return apiClient.get<ApiResponse<TypeEntretienDTO[]>>('types-entretien')
  }

  /**
   * Get maintenance type by ID
   * @param id - Maintenance type ID
   * @returns Promise with maintenance type details
   */
  async getTypeById(id: string): Promise<ApiResponse<TypeEntretienDTO>> {
    return apiClient.get<ApiResponse<TypeEntretienDTO>>(`types-entretien/${id}`)
  }

  /**
   * [MECHANIC] Create maintenance type
   * @param data - Maintenance type data
   * @returns Promise with created maintenance type
   */
  async createType(data: TypeEntretienCreateRequest): Promise<ApiResponse<TypeEntretienDTO>> {
    return apiClient.post<ApiResponse<TypeEntretienDTO>>('types-entretien', data)
  }

  /**
   * [MECHANIC] Update maintenance type
   * @param id - Maintenance type ID
   * @param data - Maintenance type data to update
   * @returns Promise with updated maintenance type
   */
  async updateType(id: string, data: TypeEntretienUpdateRequest): Promise<ApiResponse<TypeEntretienDTO>> {
    return apiClient.put<ApiResponse<TypeEntretienDTO>>(`types-entretien/${id}`, data)
  }

  /**
   * [MECHANIC] Delete maintenance type
   * @param id - Maintenance type ID
   * @returns Promise with success message
   */
  async deleteType(id: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`types-entretien/${id}`)
  }
}

/**
 * Singleton instance of TypesEntretienService
 */
export const typesEntretienService = new TypesEntretienService()
