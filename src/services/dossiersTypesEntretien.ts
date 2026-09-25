import { apiClient } from '@/api'
import type {
  CreateDossierTypeEntretienRequest,
  UpdateDossierTypeEntretienRequest,
  DossierTypeEntretienResponse,
  DossiersTypeEntretienResponse
} from '@/models'

/**
 * Maintenance type folders service
 * Handles CRUD operations for maintenance type folder definitions
 */
export class DossiersTypesEntretienService {
  /**
   * Get all maintenance type folders
   * @returns Promise with list of folders
   */
  async getDossiers(): Promise<DossiersTypeEntretienResponse> {
    return apiClient.get<DossiersTypeEntretienResponse>('dossiers-types-entretien')
  }

  /**
   * Get maintenance type folder by ID
   * @param id - Folder ID
   * @returns Promise with folder details
   */
  async getDossierById(id: string): Promise<DossierTypeEntretienResponse> {
    return apiClient.get<DossierTypeEntretienResponse>(`dossiers-types-entretien/${id}`)
  }

  /**
   * [MECHANIC] Create maintenance type folder
   * @param data - Folder data
   * @returns Promise with created folder
   */
  async createDossier(data: CreateDossierTypeEntretienRequest): Promise<DossierTypeEntretienResponse> {
    return apiClient.post<DossierTypeEntretienResponse>('dossiers-types-entretien', data)
  }

  /**
   * [MECHANIC] Update maintenance type folder
   * @param id - Folder ID
   * @param data - Folder data to update
   * @returns Promise with updated folder
   */
  async updateDossier(id: string, data: UpdateDossierTypeEntretienRequest): Promise<DossierTypeEntretienResponse> {
    return apiClient.put<DossierTypeEntretienResponse>(`dossiers-types-entretien/${id}`, data)
  }

  /**
   * [MECHANIC] Delete maintenance type folder
   * @param id - Folder ID
   * @returns Promise with success message
   */
  async deleteDossier(id: string): Promise<DossierTypeEntretienResponse> {
    return apiClient.delete<DossierTypeEntretienResponse>(`dossiers-types-entretien/${id}`)
  }
}

/**
 * Singleton instance of DossiersTypesEntretienService
 */
export const dossiersTypesEntretienService = new DossiersTypesEntretienService()
