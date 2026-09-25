import { apiClient } from '@/api'
import type {
  VehiculeDTO,
  VehiculeKilometrageDTO,
  VehiculePictureDTO,
  VehiculeFileDTO,
  VehiculeAdjustInfoDTO,
  VehiculeAdjustInfoPictureDTO
} from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * Vehicle create request
 */
export interface VehiculeCreateRequest {
  immat: string
  relaiImmat?: string
  model: string
  brand: string
  comment?: string
  pictureBase64?: string
  vin?: string
  numeroCarteGrise?: string
  dateMiseEnCirculation?: string
  typeCarburant?: string
  ptac?: number
  numeroContratAssurance?: string
  assureur?: string
  dateExpirationAssurance?: string
  dateProchainControleTechnique?: string
}

/**
 * Vehicle update request — PUT /vehicules/{id}
 * REMPLACEMENT COMPLET côté serveur : tout champ absent est remis à null.
 * Toujours renvoyer tous les champs. Exception : `pictureBase64` null ou vide = photo inchangée
 * (il n'existe pas de moyen de supprimer la photo via cette route).
 */
export interface VehiculeUpdateRequest {
  immat?: string
  relaiImmat?: string
  model?: string
  brand?: string
  comment?: string
  pictureBase64?: string
  vin?: string
  numeroCarteGrise?: string
  dateMiseEnCirculation?: string
  typeCarburant?: string
  ptac?: number
  numeroContratAssurance?: string
  assureur?: string
  dateExpirationAssurance?: string
  dateProchainControleTechnique?: string
}

/**
 * Kilometrage create request
 */
export interface KilometrageCreateRequest {
  vehiculeId: string
  km: number
}

/**
 * [ADMIN] Kilometrage create request with optional custom date
 */
export interface AdminKilometrageCreateRequest {
  vehiculeId: string
  km: number
  userUuid?: string
  createdAt?: string  // ISO 8601 format (e.g., "2025-01-15T14:20:00+01:00")
}

/**
 * [ADMIN] Kilometrage update request
 */
export interface AdminKilometrageUpdateRequest {
  km: number
  createdAt?: string  // ISO 8601 format
}

/**
 * Adjust info create request
 */
export interface AdjustInfoCreateRequest {
  vehiculeId: string
  comment: string
  picturesB64?: string[]
}

/**
 * Vehicle picture create request
 */
export interface VehiculePictureCreateRequest {
  pictureB64: string
}

// API Response interfaces matching actual API structure
export interface VehiculesListResponse {
  success: boolean
  vehicules: VehiculeDTO[]
}

export interface VehiculeResponse {
  success: boolean
  message?: string
  vehicule: VehiculeDTO
}

export interface KilometragesListResponse {
  success: boolean
  kilometrages: VehiculeKilometrageDTO[]
  /** null si size=-1 (tout sans pagination) */
  page: number | null
  /** null si size=-1 */
  size: number | null
  totalElements: number
  /** null si size=-1 */
  totalPages: number | null
}

export interface KilometrageResponse {
  success: boolean
  message?: string
  kilometrage: VehiculeKilometrageDTO
}

export interface PicturesListResponse {
  success: boolean
  pictures: VehiculePictureDTO[]
}

export interface PictureResponse {
  success: boolean
  message?: string
  picture: VehiculePictureDTO
}

export interface AdjustInfosListResponse {
  success: boolean
  adjustInfos: VehiculeAdjustInfoDTO[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdjustInfoResponse {
  success: boolean
  message?: string
  /** Sans les photos : les récupérer via GET /vehicules/adjust-infos/{id}/pictures */
  adjustInfo: VehiculeAdjustInfoDTO
}

export interface AdjustInfoPicturesListResponse {
  success: boolean
  pictures: VehiculeAdjustInfoPictureDTO[]
}

/**
 * Vehicle file upload request
 */
export interface VehiculeFileUploadRequest {
  fileB64: string
  originalName: string
  mimeType: string
}

export interface FilesListResponse {
  success: boolean
  files: VehiculeFileDTO[]
}

export interface FileResponse {
  success: boolean
  message?: string
  file: VehiculeFileDTO
}

/**
 * Vehicle management service
 * Handles vehicle CRUD operations, kilometrage tracking, pictures, and adjustment info
 */
export class VehiclesService {
  /**
   * Get all vehicles
   * @returns Promise with list of vehicles
   */
  async getVehicles(): Promise<VehiculesListResponse> {
    return apiClient.get<VehiculesListResponse>('vehicules')
  }

  /**
   * Get vehicle by ID
   * @param id - Vehicle ID
   * @returns Promise with vehicle details
   */
  async getVehicleById(id: string): Promise<VehiculeResponse> {
    return apiClient.get<VehiculeResponse>(`vehicules/${id}`)
  }

  /**
   * [MECHANIC] Create vehicle
   * @param vehicleData - Vehicle data
   * @returns Promise with created vehicle
   */
  async createVehicle(vehicleData: VehiculeCreateRequest): Promise<VehiculeResponse> {
    return apiClient.post<VehiculeResponse>('vehicules', vehicleData)
  }

  /**
   * [MECHANIC] Update vehicle
   * @param id - Vehicle ID
   * @param vehicleData - Vehicle data to update
   * @returns Promise with updated vehicle
   */
  async updateVehicle(id: string, vehicleData: VehiculeUpdateRequest): Promise<VehiculeResponse> {
    return apiClient.put<VehiculeResponse>(`vehicules/${id}`, vehicleData)
  }

  /**
   * [MECHANIC] Delete vehicle
   * @param id - Vehicle ID
   * @returns Promise with success message
   */
  async deleteVehicle(id: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`vehicules/${id}`)
  }

  /**
   * Add vehicle kilometrage — POST /vehicules/kilometrages
   * Aucune validation serveur (pas de contrôle km >= latestKm, km null → 400 technique).
   * @param data - Kilometrage data
   * @returns Promise with created kilometrage
   */
  async addKilometrage(data: KilometrageCreateRequest): Promise<KilometrageResponse> {
    return apiClient.post<KilometrageResponse>('vehicules/kilometrages', data)
  }

  /**
   * Get vehicle kilometrage history (paginated)
   * @param id - Vehicle ID
   * @param page - Page number (0-indexed)
   * @param size - Page size (max 300, use -1 to retrieve all)
   * @returns Promise with paginated list of kilometrages
   */
  async getKilometrageHistory(id: string, page: number = 0, size: number = -1): Promise<KilometragesListResponse> {
    return apiClient.get<KilometragesListResponse>(`vehicules/${id}/kilometrages?page=${page}&size=${size}`)
  }

  /**
   * [ADMIN] Add vehicle kilometrage with optional custom date/time
   * @param data - Kilometrage data with optional date
   * @returns Promise with created kilometrage
   */
  async addKilometrageAdmin(data: AdminKilometrageCreateRequest): Promise<KilometrageResponse> {
    return apiClient.post<KilometrageResponse>('vehicules/admin/kilometrages', data)
  }

  /**
   * [ADMIN] Update vehicle kilometrage
   * @param id - Kilometrage record UUID
   * @param data - Updated kilometrage data
   * @returns Promise with updated kilometrage
   */
  async updateKilometrageAdmin(id: string, data: AdminKilometrageUpdateRequest): Promise<KilometrageResponse> {
    return apiClient.put<KilometrageResponse>(`vehicules/admin/kilometrages/${id}`, data)
  }

  /**
   * [MECHANIC] Add vehicle picture
   * Route absente du contrat d'API (non vérifiée) — la photo de profil passe par `pictureBase64` (POST/PUT /vehicules)
   * @param id - Vehicle ID
   * @param pictureData - Picture data (base64)
   * @returns Promise with created picture
   */
  async addPicture(id: string, pictureData: VehiculePictureCreateRequest): Promise<PictureResponse> {
    return apiClient.post<PictureResponse>(`vehicules/${id}/pictures`, pictureData)
  }

  /**
   * Get vehicle pictures
   * Route absente du contrat d'API (non vérifiée)
   * @param id - Vehicle ID
   * @returns Promise with list of pictures
   */
  async getVehiclePictures(id: string): Promise<PicturesListResponse> {
    return apiClient.get<PicturesListResponse>(`vehicules/${id}/pictures`)
  }

  /**
   * [MECHANIC] Delete vehicle picture
   * Route absente du contrat d'API (non vérifiée)
   * @param pictureId - Picture ID
   * @returns Promise with success message
   */
  async deletePicture(pictureId: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`vehicules/pictures/${pictureId}`)
  }

  /**
   * Get vehicle files (images, PDFs, documents)
   * @param id - Vehicle ID
   * @returns Promise with list of files
   */
  async getVehicleFiles(id: string): Promise<FilesListResponse> {
    return apiClient.get<FilesListResponse>(`vehicules/${id}/files`)
  }

  /**
   * [MECHANIC] Add file to vehicle
   * @param id - Vehicle ID
   * @param fileData - File data (base64, name, mime type)
   * @returns Promise with created file
   */
  async addFile(id: string, fileData: VehiculeFileUploadRequest): Promise<FileResponse> {
    return apiClient.post<FileResponse>(`vehicules/${id}/files`, fileData)
  }

  /**
   * [MECHANIC] Delete vehicle file
   * @param fileId - File ID
   * @returns Promise with success message
   */
  async deleteFile(fileId: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`vehicules/files/${fileId}`)
  }

  /**
   * Create vehicle adjustment info
   * @param data - Adjustment info data
   * @returns Promise with created adjustment info
   */
  async createAdjustInfo(data: AdjustInfoCreateRequest): Promise<AdjustInfoResponse> {
    return apiClient.post<AdjustInfoResponse>('vehicules/adjust-infos', data)
  }

  /**
   * Get vehicle adjustment info (paginated)
   * @param id - Vehicle ID
   * @param page - Page number (0-indexed)
   * @param size - Page size (max 50)
   * @returns Promise with paginated list of adjustment infos
   */
  async getAdjustInfo(id: string, page: number = 0, size: number = 10): Promise<AdjustInfosListResponse> {
    return apiClient.get<AdjustInfosListResponse>(`vehicules/${id}/adjust-infos?page=${page}&size=${size}`)
  }

  /**
   * Get adjustment info pictures
   * @param adjustInfoId - Adjustment info ID
   * @returns Promise with list of pictures
   */
  async getAdjustInfoPictures(adjustInfoId: string): Promise<AdjustInfoPicturesListResponse> {
    return apiClient.get<AdjustInfoPicturesListResponse>(`vehicules/adjust-infos/${adjustInfoId}/pictures`)
  }
}

/**
 * Singleton instance of VehiclesService
 */
export const vehiclesService = new VehiclesService()
