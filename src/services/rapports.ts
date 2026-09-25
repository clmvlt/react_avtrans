import { apiClient } from '@/api'
import type { RapportVehiculeDTO } from '@/models'
import type { SuccessMessageResponse, ApiResponse } from '@/types'

/**
 * Vehicle report create request
 */
export interface RapportVehiculeCreateRequest {
  vehiculeId: string
  commentaire?: string | null
  /** Data URI ("data:image/jpeg;base64,...") ou base64 brut */
  picturesB64?: string[] | null
}

/**
 * Vehicle report picture DTO
 */
export interface RapportPictureDTO {
  id: string
  rapportVehiculeId?: string
  pictureUrl: string
  createdAt: string
}

/**
 * Vehicle report picture create request
 */
export interface RapportPictureCreateRequest {
  pictureB64: string
}

/**
 * Paginated response for vehicle reports
 */
export interface RapportsListResponse {
  success: boolean
  message?: string
  data: RapportVehiculeDTO[]
  /** null si size=-1 */
  page: number | null
  /** null si size=-1 */
  size: number | null
  totalElements: number
  /** null si size=-1 */
  totalPages: number | null
}

/**
 * Vehicle reports service
 * Handles vehicle inspection reports and pictures
 */
export class RapportsService {
  /**
   * Create a vehicle report
   * @param data - Report data
   * @returns Promise with created report
   */
  async createRapport(data: RapportVehiculeCreateRequest): Promise<ApiResponse<RapportVehiculeDTO>> {
    return apiClient.post<ApiResponse<RapportVehiculeDTO>>('rapports', data)
  }

  /**
   * Get current user's latest report
   * GET /rapports/me/latest → { success, message, data: RapportVehiculeDTO }
   * 400 "Aucun rapport trouvé pour cet utilisateur" si aucun rapport : à traiter
   * comme un état vide (ApiError.status === 400), pas comme une erreur.
   * @returns Promise with latest report
   */
  async getMyLatestRapport(): Promise<ApiResponse<RapportVehiculeDTO>> {
    return apiClient.get<ApiResponse<RapportVehiculeDTO>>('rapports/me/latest')
  }

  /**
   * [MECHANIC] Get all reports for a vehicle (paginated)
   * @param vehiculeId - Vehicle ID
   * @param page - Page number (0-indexed)
   * @param size - Page size (max 50, use -1 to retrieve all)
   * @returns Promise with paginated list of reports
   */
  async getRapports(vehiculeId: string, page: number = 0, size: number = 10): Promise<RapportsListResponse> {
    return apiClient.get<RapportsListResponse>(`rapports/${vehiculeId}?page=${page}&size=${size}`)
  }

  /**
   * Get report pictures
   * Route absente du contrat d'API (non vérifiée)
   * @param id - Report ID
   * @returns Promise with list of pictures
   */
  async getRapportPictures(id: string): Promise<ApiResponse<RapportPictureDTO[]>> {
    return apiClient.get<ApiResponse<RapportPictureDTO[]>>(`rapports/${id}/pictures`)
  }

  /**
   * Add picture to a report
   * Route absente du contrat d'API (non vérifiée)
   * @param id - Report ID
   * @param pictureData - Picture data (base64)
   * @returns Promise with created picture
   */
  async addPicture(id: string, pictureData: RapportPictureCreateRequest): Promise<ApiResponse<RapportPictureDTO>> {
    return apiClient.post<ApiResponse<RapportPictureDTO>>(`rapports/${id}/pictures`, pictureData)
  }

  /**
   * [MECHANIC] Delete report picture
   * Route absente du contrat d'API (non vérifiée)
   * @param pictureId - Picture ID
   * @returns Promise with success message
   */
  async deletePicture(pictureId: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`rapports/pictures/${pictureId}`)
  }
}

/**
 * Singleton instance of RapportsService
 */
export const rapportsService = new RapportsService()
