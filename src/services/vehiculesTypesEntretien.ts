import { apiClient } from '@/api'
import type { VehiculeTypeEntretienDTO } from '@/models'
import type { SuccessMessageResponse, ApiResponse } from '@/types'

/**
 * Periodicity type enum
 */
export type PeriodiciteType = 'KILOMETRAGE' | 'TEMPOREL'

/**
 * Vehicle maintenance configuration create request
 */
export interface VehiculeTypeEntretienCreateRequest {
  vehiculeId: string
  typeEntretienId: string
  periodiciteType: PeriodiciteType
  periodiciteValeur: number
}

/**
 * Vehicle maintenance configuration update request
 */
export interface VehiculeTypeEntretienUpdateRequest {
  periodiciteType?: PeriodiciteType
  periodiciteValeur?: number
  actif?: boolean
}

/**
 * Vehicle maintenance configuration service
 * Handles maintenance schedule configuration per vehicle
 */
export class VehiculesTypesEntretienService {
  /**
   * [MECHANIC] Create vehicle maintenance configuration
   * @param data - Configuration data
   * @returns Promise with created configuration
   */
  async create(data: VehiculeTypeEntretienCreateRequest): Promise<ApiResponse<VehiculeTypeEntretienDTO>> {
    return apiClient.post<ApiResponse<VehiculeTypeEntretienDTO>>('vehicules-types-entretien', data)
  }

  /**
   * Get vehicle maintenance configuration by ID
   * @param id - Configuration ID
   * @returns Promise with configuration details
   */
  async getById(id: string): Promise<ApiResponse<VehiculeTypeEntretienDTO>> {
    return apiClient.get<ApiResponse<VehiculeTypeEntretienDTO>>(`vehicules-types-entretien/${id}`)
  }

  /**
   * [MECHANIC] Update vehicle maintenance configuration
   * @param id - Configuration ID
   * @param data - Configuration data to update
   * @returns Promise with updated configuration
   */
  async update(id: string, data: VehiculeTypeEntretienUpdateRequest): Promise<ApiResponse<VehiculeTypeEntretienDTO>> {
    return apiClient.put<ApiResponse<VehiculeTypeEntretienDTO>>(`vehicules-types-entretien/${id}`, data)
  }

  /**
   * [MECHANIC] Delete vehicle maintenance configuration
   * @param id - Configuration ID
   * @returns Promise with success message
   */
  async delete(id: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`vehicules-types-entretien/${id}`)
  }

  /**
   * Get all configurations for a vehicle
   * @param vehiculeId - Vehicle ID
   * @returns Promise with list of configurations
   */
  async getByVehiculeId(vehiculeId: string): Promise<ApiResponse<VehiculeTypeEntretienDTO[]>> {
    return apiClient.get<ApiResponse<VehiculeTypeEntretienDTO[]>>(`vehicules-types-entretien/vehicule/${vehiculeId}`)
  }

  /**
   * Get active configurations for a vehicle
   * @param vehiculeId - Vehicle ID
   * @returns Promise with list of active configurations
   */
  async getActiveByVehiculeId(vehiculeId: string): Promise<ApiResponse<VehiculeTypeEntretienDTO[]>> {
    return apiClient.get<ApiResponse<VehiculeTypeEntretienDTO[]>>(`vehicules-types-entretien/vehicule/${vehiculeId}/actives`)
  }
}

/**
 * Singleton instance of VehiculesTypesEntretienService
 */
export const vehiculesTypesEntretienService = new VehiculesTypesEntretienService()
