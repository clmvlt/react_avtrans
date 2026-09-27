import { apiClient } from '@/api'
import type { AbsenceDecompteDTO, AbsenceDTO } from '@/models'

/**
 * Absence status enum
 */
export type AbsenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

/**
 * Absence create request (user)
 */
export interface AbsenceCreateRequest {
  startDate: string
  endDate: string
  reason?: string
  absenceTypeUuid?: string
  customType?: string
  period?: string
}

/**
 * Admin absence create request
 */
export interface AdminAbsenceCreateRequest {
  userUuid: string
  startDate: string
  endDate: string
  reason?: string
  absenceTypeUuid?: string
  customType?: string
  period?: string
  approved?: boolean
}

/**
 * Admin absence update request — PUT /absences/admin/{uuid}
 * All fields optional (partial update). Use null to explicitly clear a field.
 */
export interface AdminAbsenceUpdateRequest {
  startDate?: string
  endDate?: string
  reason?: string | null
  absenceTypeUuid?: string | null
  customType?: string | null
  period?: string
}

/**
 * Absence count preview request (D8) — POST /absences/decompte (userUuid ignoré)
 * et POST /absences/admin/decompte (userUuid obligatoire)
 */
export interface AbsenceDecompteRequest {
  startDate: string
  endDate: string
  period?: string
  /** Absent : type personnalisé (jours ouvrables, crédite des heures) */
  absenceTypeUuid?: string
  userUuid?: string
}

/**
 * API response for an absence count preview (D8)
 */
export interface AbsenceDecompteResponse {
  success: boolean
  message?: string | null
  data: AbsenceDecompteDTO
}

/**
 * Forced hours of an absence (D8) — PUT /absences/admin/{uuid}/heures ; null = calcul automatique
 */
export interface AbsenceHeuresRequest {
  heures: number | null
}

/**
 * Absence validation request
 */
export interface AbsenceValidationRequest {
  approved: boolean
  rejectionReason?: string
}

/**
 * Absence search filters
 */
export interface AbsenceSearchParams {
  startDate?: string
  endDate?: string
  status?: AbsenceStatus
  absenceTypeUuid?: string
  userUuid?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  includePast?: boolean
}

/**
 * API response for a single absence
 */
export interface AbsenceResponse {
  success: boolean
  message?: string
  absence: AbsenceDTO
}

/**
 * API response for DELETE routes (absence is always null)
 */
export interface AbsenceDeleteResponse {
  success: boolean
  message?: string
  absence: null
}

/**
 * API response for a list of absences (paginated)
 */
export interface AbsenceListResponse {
  success: boolean
  absences: AbsenceDTO[]
  totalPages: number
  totalElements: number
  currentPage: number
}

/**
 * Planning query parameters
 */
export interface PlanningQueryParams {
  periodType?: 'week' | 'month' | 'custom'
  year?: number
  month?: number
  week?: number
  startDate?: string
  endDate?: string
}

/**
 * Planning response DTO - matches GET /absences/admin/planning
 */
export interface AbsencePlanningResponse {
  success: boolean
  startDate: string
  endDate: string
  periodType: string
  users: PlanningUserDTO[]
}

/**
 * Planning user with absences
 */
export interface PlanningUserDTO {
  uuid: string
  email: string
  firstName: string
  lastName: string
  role: {
    uuid: string
    nom: string
    color?: string
  }
  pictureUrl?: string
  isCouchette: boolean
  absences: AbsenceDTO[]
}

/**
 * Retire les clés `undefined`, `null` et chaînes vides d'un objet de filtres
 */
function stripEmpty<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>
}

/**
 * Absence management service
 * Handles absence requests, validation, and planning
 */
export class AbsencesService {
  /**
   * Create an absence request
   * @param data - Absence data
   * @returns Promise with created absence
   */
  async createAbsenceRequest(data: AbsenceCreateRequest): Promise<AbsenceResponse> {
    return apiClient.post<AbsenceResponse>('absences', data)
  }

  /**
   * Get my absence requests with filters
   * POST /absences/my — filtre : absence ENTIÈREMENT dans [startDate ; endDate].
   * Défaut serveur sans aucune date : [aujourd'hui - 30 j ; aujourd'hui + 10 ans].
   * `userUuid` et `includePast` sont ignorés sur cette route.
   * sortBy sûrs : startDate | endDate | createdAt | status
   * @param filters - Search filters
   * @returns Promise with paginated absences
   */
  async getAbsences(filters?: AbsenceSearchParams): Promise<AbsenceListResponse> {
    return apiClient.post<AbsenceListResponse>('absences/my', stripEmpty(filters || {}))
  }

  /**
   * Cancel an absence request (if pending)
   * 200 : { success, message: "Absence annulée avec succès", absence: null }
   * @param uuid - Absence UUID
   * @returns Promise with success message
   */
  async cancelAbsence(uuid: string): Promise<AbsenceDeleteResponse> {
    return apiClient.delete<AbsenceDeleteResponse>(`absences/${uuid}`)
  }

  /**
   * Preview the day and hour count of an absence for the current user (D8)
   * @param data - Dates, period and type
   * @returns Promise with the count
   */
  async getDecompte(data: AbsenceDecompteRequest): Promise<AbsenceDecompteResponse> {
    return apiClient.post<AbsenceDecompteResponse>('absences/decompte', data)
  }

  // Admin methods

  /**
   * [ADMIN] Create absence for a user
   * @param data - Absence data with user UUID
   * @returns Promise with created absence
   */
  async createAbsenceForUser(data: AdminAbsenceCreateRequest): Promise<AbsenceResponse> {
    return apiClient.post<AbsenceResponse>('absences/admin/create', data)
  }

  /**
   * [ADMIN] Search and filter absences
   * @param filters - Search filters
   * @returns Promise with paginated absences
   */
  async searchAbsences(filters?: AbsenceSearchParams): Promise<AbsenceListResponse> {
    return apiClient.post<AbsenceListResponse>('absences/admin/search', filters || {})
  }

  /**
   * [ADMIN] Get absence by UUID
   * @param uuid - Absence UUID
   * @returns Promise with absence details
   */
  async getAbsenceById(uuid: string): Promise<AbsenceResponse> {
    return apiClient.get<AbsenceResponse>(`absences/admin/${uuid}`)
  }

  /**
   * [ADMIN] Validate or reject an absence
   * @param uuid - Absence UUID
   * @param data - Validation data
   * @returns Promise with updated absence
   */
  async validateAbsence(uuid: string, data: AbsenceValidationRequest): Promise<AbsenceResponse> {
    return apiClient.post<AbsenceResponse>(`absences/admin/${uuid}/validate`, data)
  }

  /**
   * [ADMIN] Reject an absence (convenience method)
   * @param uuid - Absence UUID
   * @param rejectionReason - Rejection reason
   * @returns Promise with updated absence
   */
  async rejectAbsence(uuid: string, rejectionReason?: string): Promise<AbsenceResponse> {
    return this.validateAbsence(uuid, { approved: false, rejectionReason })
  }

  /**
   * [ADMIN] Update a non-approved absence
   * @param uuid - Absence UUID
   * @param data - Fields to update
   * @returns Promise with updated absence
   */
  async updateAbsenceByAdmin(uuid: string, data: AdminAbsenceUpdateRequest): Promise<AbsenceResponse> {
    return apiClient.put<AbsenceResponse>(`absences/admin/${uuid}`, data)
  }

  /**
   * [ADMIN] Delete absence permanently
   * @param uuid - Absence UUID
   * @returns Promise with deleted absence
   */
  async deleteAbsence(uuid: string): Promise<AbsenceResponse> {
    return apiClient.delete<AbsenceResponse>(`absences/admin/${uuid}`)
  }

  /**
   * [ADMIN] Preview the day and hour count of an absence for a user (D8)
   * @param data - Dates, period, type and userUuid
   * @returns Promise with the count
   */
  async getDecompteForUser(data: AbsenceDecompteRequest): Promise<AbsenceDecompteResponse> {
    return apiClient.post<AbsenceDecompteResponse>('absences/admin/decompte', data)
  }

  /**
   * [ADMIN] Set the hours credited by an absence, or null to go back to the automatic count (D8)
   * @param uuid - Absence UUID
   * @param data - Hours
   * @returns Promise with updated absence
   */
  async setHeuresForcees(uuid: string, data: AbsenceHeuresRequest): Promise<AbsenceResponse> {
    return apiClient.put<AbsenceResponse>(`absences/admin/${uuid}/heures`, data)
  }

  /**
   * [ADMIN] Get absence planning
   * @param params - Query parameters for period
   * @returns Promise with planning data
   */
  async getAbsencePlanning(params?: PlanningQueryParams): Promise<AbsencePlanningResponse> {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiClient.get<AbsencePlanningResponse>(`absences/admin/planning${queryString}`)
  }
}

/**
 * Singleton instance of AbsencesService
 */
export const absencesService = new AbsencesService()
