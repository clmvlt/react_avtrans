import { apiClient } from '@/api'
import type { EntretienDTO, VehiculeProchainEntretienDTO } from '@/models'
import type { SuccessMessageResponse, PagedResponse, PaginationParams } from '@/types'

/**
 * Response for vehicles with upcoming maintenance
 */
export interface VehiculesProchainEntretiensResponse {
  success: boolean
  data: VehiculeProchainEntretienDTO[]
}

/**
 * Response for vehicle upcoming maintenance
 */
export interface VehiculeProchainEntretienResponse {
  success: boolean
  data: VehiculeProchainEntretienDTO
}

/**
 * Response for single entretien
 */
export interface EntretienResponse {
  success: boolean
  message?: string
  entretien: EntretienDTO
}

/**
 * Response for entretien list
 */
export interface EntretiensListResponse {
  success: boolean
  entretiens: EntretienDTO[]
}

/**
 * Response for files list
 */
export interface EntretienFilesResponse {
  success: boolean
  files: EntretienFileDTO[]
}

/**
 * Response for single file
 */
export interface EntretienFileResponse {
  success: boolean
  message?: string
  file: EntretienFileDTO
}

/**
 * File upload request for maintenance
 */
export interface EntretienFileUploadRequest {
  /** File content encoded in base64 */
  fileB64: string
  /** Original file name */
  originalName: string
  /** File MIME type */
  mimeType: string
}

/**
 * Maintenance create request
 */
export interface EntretienCreateRequest {
  vehiculeId: string
  typeEntretienId: string
  dateEntretien: string
  kilometrage: number
  commentaire?: string
  cout?: number
  /** Files to attach (PDF, images, etc.) */
  files?: EntretienFileUploadRequest[]
}

/**
 * Maintenance update request
 */
export interface EntretienUpdateRequest {
  typeEntretienId?: string
  dateEntretien?: string
  kilometrage?: number
  commentaire?: string
  cout?: number
}

/**
 * Maintenance search filters
 */
export interface EntretienSearchParams extends PaginationParams {
  startDate?: string
  endDate?: string
  vehiculeId?: string
  typeEntretienId?: string
  mecanicienId?: string
  kmMin?: number
  kmMax?: number
  coutMin?: number
  coutMax?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

/**
 * Maintenance file DTO (PDF, image, document)
 */
export interface EntretienFileDTO {
  /** Unique file identifier */
  id: string
  /** Maintenance record identifier */
  entretienId?: string
  /** Base64 encoded file content */
  fileB64?: string
  /** Original file name */
  originalName?: string
  /** File MIME type */
  mimeType?: string
  /** File size in bytes */
  fileSize?: number
  /** File upload date */
  createdAt: string
}

/**
 * Maintenance management service
 * Handles maintenance records, alerts, and files
 */
export class EntretiensService {
  /**
   * Get vehicles with upcoming maintenance
   * @returns Promise with list of vehicles and their upcoming maintenance
   */
  async getEntretiensAVenir(): Promise<VehiculesProchainEntretiensResponse> {
    return apiClient.get<VehiculesProchainEntretiensResponse>('entretiens/vehicules-prochains-entretiens')
  }

  /**
   * [USER] Get upcoming maintenance for a specific vehicle
   * Retrieves the next scheduled maintenance information (by km and by date)
   * @param vehiculeId - Vehicle UUID
   * @returns Promise with upcoming maintenance info (prochainEntretienKm and prochainEntretienDate)
   */
  async getVehicleUpcomingMaintenance(vehiculeId: string): Promise<VehiculeProchainEntretienResponse> {
    return apiClient.get<VehiculeProchainEntretienResponse>(`entretiens/vehicule/${vehiculeId}/prochains-entretiens`)
  }

  /**
   * [MECHANIC] Create maintenance record
   * @param data - Maintenance data
   * @returns Promise with created maintenance
   */
  async createEntretien(data: EntretienCreateRequest): Promise<EntretienResponse> {
    return apiClient.post<EntretienResponse>('entretiens', data)
  }

  /**
   * Get maintenance by ID
   * @param id - Maintenance ID
   * @returns Promise with maintenance details
   */
  async getEntretienById(id: string): Promise<EntretienResponse> {
    return apiClient.get<EntretienResponse>(`entretiens/${id}`)
  }

  /**
   * [MECHANIC] Update maintenance
   * @param id - Maintenance ID
   * @param data - Maintenance data to update
   * @returns Promise with updated maintenance
   */
  async updateEntretien(id: string, data: EntretienUpdateRequest): Promise<EntretienResponse> {
    return apiClient.put<EntretienResponse>(`entretiens/${id}`, data)
  }

  /**
   * [MECHANIC] Delete maintenance
   * @param id - Maintenance ID
   * @returns Promise with success message
   */
  async deleteEntretien(id: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`entretiens/${id}`)
  }

  /**
   * Get maintenance history for a vehicle
   * @param vehiculeId - Vehicle ID
   * @returns Promise with list of maintenances
   */
  async getHistory(vehiculeId: string): Promise<EntretiensListResponse> {
    return apiClient.get<EntretiensListResponse>(`entretiens/vehicule/${vehiculeId}`)
  }

  /**
   * Search maintenance records with filters and pagination
   * @param filters - Search filters
   * @returns Promise with paginated maintenance records
   */
  async searchHistory(filters?: EntretienSearchParams): Promise<PagedResponse<EntretienDTO>> {
    return apiClient.post<PagedResponse<EntretienDTO>>('entretiens/history', filters || {})
  }

  // =========================================
  // File management methods
  // =========================================

  /**
   * Get maintenance files
   * @param id - Maintenance ID
   * @returns Promise with list of files
   */
  async getEntretienFiles(id: string): Promise<EntretienFilesResponse> {
    return apiClient.get<EntretienFilesResponse>(`entretiens/${id}/files`)
  }

  /**
   * [MECHANIC] Add maintenance file
   * @param id - Maintenance ID
   * @param fileData - File data (base64 + metadata)
   * @returns Promise with created file
   */
  async addFile(id: string, fileData: EntretienFileUploadRequest): Promise<EntretienFileResponse> {
    return apiClient.post<EntretienFileResponse>(`entretiens/${id}/files`, fileData)
  }

  /**
   * [MECHANIC] Delete maintenance file
   * @param fileId - File ID
   * @returns Promise with success message
   */
  async deleteFile(fileId: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`entretiens/files/${fileId}`)
  }
}

/**
 * Singleton instance of EntretiensService
 */
export const entretiensService = new EntretiensService()
