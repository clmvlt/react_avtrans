import { apiClient } from '@/api'
import type { AbsenceTypeDTO } from '@/models'

/**
 * Absence type create/update request
 */
export interface AbsenceTypeCreateRequest {
  name: string
  color: string
}

/**
 * API response for a list of absence types
 */
export interface AbsenceTypeListResponse {
  success: boolean
  types: AbsenceTypeDTO[]
}

/**
 * API response for a single absence type
 */
export interface AbsenceTypeResponse {
  success: boolean
  message?: string
  absenceType: AbsenceTypeDTO
}

/**
 * Absence types service
 * Handles CRUD operations for absence type definitions
 */
export class AbsenceTypesService {
  /**
   * Get all absence types
   * @returns Promise with list of absence types
   */
  async getAbsenceTypes(): Promise<AbsenceTypeListResponse> {
    return apiClient.get<AbsenceTypeListResponse>('absence-types')
  }

  /**
   * Get absence type by UUID
   * @param uuid - Absence type UUID
   * @returns Promise with absence type details
   */
  async getTypeById(uuid: string): Promise<AbsenceTypeResponse> {
    return apiClient.get<AbsenceTypeResponse>(`absence-types/${uuid}`)
  }

  /**
   * [ADMIN] Create absence type
   * @param data - Absence type data
   * @returns Promise with created absence type
   */
  async createType(data: AbsenceTypeCreateRequest): Promise<AbsenceTypeResponse> {
    return apiClient.post<AbsenceTypeResponse>('absence-types', data)
  }

  /**
   * [ADMIN] Update absence type
   * @param uuid - Absence type UUID
   * @param data - Absence type data to update
   * @returns Promise with updated absence type
   */
  async updateType(uuid: string, data: AbsenceTypeCreateRequest): Promise<AbsenceTypeResponse> {
    return apiClient.put<AbsenceTypeResponse>(`absence-types/${uuid}`, data)
  }

  /**
   * [ADMIN] Delete absence type
   * @param uuid - Absence type UUID
   * @returns Promise with deleted absence type
   */
  async deleteType(uuid: string): Promise<AbsenceTypeResponse> {
    return apiClient.delete<AbsenceTypeResponse>(`absence-types/${uuid}`)
  }
}

/**
 * Singleton instance of AbsenceTypesService
 */
export const absenceTypesService = new AbsenceTypesService()
