import { apiClient } from '@/api'
import type { ServiceDTO, ServiceModificationDTO, ServiceModificationSearchRequest } from '@/models'
import type { SuccessMessageResponse, ApiResponse, PagedResponse } from '@/types'

/**
 * Body commun aux 4 actions de pointage (POST /services/start|end|break/start|break/end).
 * Les coordonnées sont optionnelles (null accepté). `userUuid` est réservé aux admins
 * (→ 403 si fourni par un non-admin).
 */
export interface GpsLocationRequest {
  latitude: number | null
  longitude: number | null
  userUuid?: string // Admin only - to perform action for another user
}

/** @deprecated alias de GpsLocationRequest — l'API n'a ni vehiculeId, ni startDate, ni comment */
export type ServiceStartRequest = GpsLocationRequest

/** @deprecated alias de GpsLocationRequest — l'API n'a ni vehiculeId, ni endDate, ni comment */
export type ServiceEndRequest = GpsLocationRequest

/**
 * Worked hours response
 * Values are in hours (decimal format)
 */
export interface WorkedHoursDTO {
  year?: number
  month?: number
  week?: number
  day?: number
  lastMonth?: number
}

/**
 * Service search filters — body de POST /services/history
 * (l'API ne connaît que `sortBy` / `sortDirection`, pas `sort` / `direction`)
 */
export interface ServiceSearchParams {
  /** Numéro de page (0-indexé) */
  page?: number
  /** Taille de page */
  size?: number
  /** true = pauses seules, false = services seuls, undefined = tout */
  isBreak?: boolean
  /** yyyy-MM-dd — filtre debut >= startDate 00:00 */
  startDate?: string
  /** yyyy-MM-dd — jour de fin INCLUS (le service ajoute +1 jour pour compenser la borne serveur à minuit) */
  endDate?: string
  /** Valeurs sûres : debut | fin | duree (autre → 400 technique) */
  sortBy?: 'debut' | 'fin' | 'duree'
  /** "asc" ; toute autre valeur = desc */
  sortDirection?: 'asc' | 'desc'
}

/**
 * Hours query parameters — GET /services/hours
 * `week` (n° ISO) n'est fiable que pour l'année courante.
 */
export interface HoursQueryParams {
  period?: 'day' | 'week' | 'month' | 'year' | 'lastmonth'
  year?: number
  month?: number
  week?: number
  day?: number
}

/**
 * Service create request (admin)
 */
export interface ServiceCreateRequest {
  userUuid: string
  vehiculeId?: string
  debut: string
  fin?: string
  latitude?: number
  longitude?: number
  comment?: string
}

/**
 * Service update request (admin)
 */
export interface ServiceUpdateRequest {
  debut?: string
  fin?: string
  latitude?: number
  longitude?: number
  isBreak?: boolean
}

/**
 * Active service data
 */
export interface ActiveServiceData {
  uuid: string
  debut: string
  fin?: string | null
  duree?: number
  isBreak: boolean
  latitude?: number
  longitude?: number
  isAdmin?: boolean
  userUuid: string
}

/**
 * Active service response (admin)
 */
export interface ActiveServiceResponse {
  success: boolean
  service: ActiveServiceData | null
}

/**
 * Ajoute un jour à une date yyyy-MM-dd (calcul en local, sans décalage UTC)
 */
function addOneDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  const next = new Date(y, m - 1, d + 1)
  const mm = String(next.getMonth() + 1).padStart(2, '0')
  const dd = String(next.getDate()).padStart(2, '0')
  return `${next.getFullYear()}-${mm}-${dd}`
}

/**
 * Time tracking service (services de travail)
 * Handles user time tracking, breaks, and service history
 */
export class UserServicesService {
  /**
   * Start a service with GPS coordinates
   * If userUuid is provided, starts service for that user (admin only)
   * @param data - GPS coordinates and optional user UUID
   * @returns Promise with started service
   */
  async startService(data: GpsLocationRequest): Promise<ServiceDTO> {
    return apiClient.post<ServiceDTO>('services/start', data)
  }

  /**
   * End a service with GPS coordinates
   * If userUuid is provided, ends service for that user (admin only)
   * @param data - GPS coordinates and optional user UUID
   * @returns Promise with ended service
   */
  async endService(data: GpsLocationRequest): Promise<ServiceDTO> {
    return apiClient.post<ServiceDTO>('services/end', data)
  }

  /**
   * Start a break with GPS coordinates
   * If userUuid is provided, starts break for that user (admin only)
   * @param data - GPS coordinates and optional user UUID
   * @returns Promise with started break
   */
  async startBreak(data: GpsLocationRequest): Promise<ServiceDTO> {
    return apiClient.post<ServiceDTO>('services/break/start', data)
  }

  /**
   * End a break with GPS coordinates
   * If userUuid is provided, ends break for that user (admin only)
   * @param data - GPS coordinates and optional user UUID
   * @returns Promise with ended break
   */
  async endBreak(data: GpsLocationRequest): Promise<ServiceDTO> {
    return apiClient.post<ServiceDTO>('services/break/end', data)
  }

  /**
   * Get active service for the authenticated user
   * @returns Promise with active service response
   */
  async getCurrentService(): Promise<{ success: boolean; service: ServiceDTO | null }> {
    return apiClient.get<{ success: boolean; service: ServiceDTO | null }>('services/active')
  }

  /**
   * Get worked hours (service duration - break duration)
   * If period is not provided, returns all periods (year, month, week, day, lastMonth)
   * @param params - Query parameters for specific period
   * @returns Promise with worked hours
   */
  async getWorkedHours(params?: HoursQueryParams): Promise<WorkedHoursDTO> {
    // Ne jamais sérialiser une clé undefined ("period=undefined" → 400 "Invalid period")
    const query = new URLSearchParams()
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.append(key, String(value))
    })
    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<WorkedHoursDTO>(`services/hours${queryString}`)
  }

  /**
   * Get monthly services
   * If year and month are not provided, uses current month
   * @param year - Year (e.g., 2025). Defaults to current year
   * @param month - Month (1-12). Defaults to current month
   * @returns Promise with monthly services
   */
  async getMonthlyServices(year?: number, month?: number): Promise<ServiceDTO[]> {
    const params = new URLSearchParams()
    if (year !== undefined) params.append('year', year.toString())
    if (month !== undefined) params.append('month', month.toString())
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<ServiceDTO[]>(`services/month${queryString}`)
  }

  /**
   * Get services history with filters and pagination
   * @param filters - Search filters
   * @returns Promise with paginated services
   */
  async getServiceHistory(filters?: ServiceSearchParams): Promise<PagedResponse<ServiceDTO>> {
    const body: ServiceSearchParams = {}
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (body as Record<string, unknown>)[key] = value
        }
      })
    }
    // Piège serveur : la borne endDate est MINUIT du jour de fin → le jour de fin est exclu.
    // On envoie jour + 1 pour que la date saisie par l'utilisateur soit incluse.
    if (body.endDate) {
      body.endDate = addOneDay(body.endDate)
    }
    return apiClient.post<PagedResponse<ServiceDTO>>('services/history', body)
  }

  /**
   * Get daily services for the authenticated user
   * Returns all services for the current day (from 00:00 to 23:59)
   * @returns Promise with daily services
   */
  async getDailyServices(): Promise<ServiceDTO[]> {
    return apiClient.get<ServiceDTO[]>('services/user/daily')
  }

  // Admin methods

  /**
   * [ADMIN] Create service for a user
   * @param serviceData - Service data
   * @returns Promise with created service
   */
  async createService(serviceData: ServiceCreateRequest): Promise<ApiResponse<ServiceDTO>> {
    return apiClient.post<ApiResponse<ServiceDTO>>('services/admin/create', serviceData)
  }

  /**
   * [ADMIN] Get user services with filters and pagination
   * @param userUuid - User UUID
   * @param filters - Search filters
   * @returns Promise with paginated user services
   */
  async searchServices(userUuid: string, filters?: ServiceSearchParams): Promise<PagedResponse<ServiceDTO>> {
    return apiClient.post<PagedResponse<ServiceDTO>>(`services/admin/user/${userUuid}`, filters || {})
  }

  /**
   * [ADMIN] Get user worked hours
   * @param userUuid - User UUID
   * @param params - Query parameters for specific period
   * @returns Promise with worked hours
   */
  async getUserWorkedHours(userUuid: string, params?: HoursQueryParams): Promise<ApiResponse<WorkedHoursDTO>> {
    const query = new URLSearchParams()
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') query.append(key, String(value))
    })
    const queryString = query.toString() ? `?${query.toString()}` : ''
    return apiClient.get<ApiResponse<WorkedHoursDTO>>(`services/admin/hours/${userUuid}${queryString}`)
  }

  /**
   * [ADMIN] Update service
   * @param serviceUuid - Service UUID
   * @param serviceData - Service data to update
   * @returns Promise with updated service
   */
  async validateService(serviceUuid: string, serviceData: ServiceUpdateRequest): Promise<ApiResponse<ServiceDTO>> {
    return apiClient.put<ApiResponse<ServiceDTO>>(`services/admin/${serviceUuid}`, serviceData)
  }

  /**
   * [ADMIN] Delete service
   * @param serviceUuid - Service UUID
   * @returns Promise with success message
   */
  async deleteService(serviceUuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`services/admin/${serviceUuid}`)
  }

  /**
   * [ADMIN] Get user active service
   * @param userUuid - User UUID
   * @returns Promise with active service or null if no active service
   */
  async getActiveService(userUuid: string): Promise<ActiveServiceResponse | null> {
    return apiClient.get<ActiveServiceResponse | null>(`services/admin/${userUuid}/active`)
  }

  /**
   * [ADMIN] Historique des actions admin (création, modification, suppression) sur un pointage,
   * du plus récent au plus ancien. Fonctionne aussi pour un pointage supprimé.
   * @param serviceUuid - Service UUID
   * @returns Promise avec `{ success, data }` — `data` vaut [] s'il n'y a rien
   */
  async getServiceModifications(serviceUuid: string): Promise<ApiResponse<ServiceModificationDTO[]>> {
    return apiClient.get<ApiResponse<ServiceModificationDTO[]>>(`services/admin/${serviceUuid}/modifications`)
  }

  /**
   * [ADMIN] Journal paginé des actions admin sur les pointages (le plus récent d'abord).
   * `startDate` / `endDate` (yyyy-MM-dd) filtrent sur la date de l'action, bornes incluses.
   * Action invalide → 400 `{ success: false, message }`.
   * @param filters - Filtres optionnels
   * @returns Promise avec la page (enveloppe `success` + champs de pagination à la racine)
   */
  async searchServiceModifications(filters?: ServiceModificationSearchRequest): Promise<PagedResponse<ServiceModificationDTO>> {
    const body: ServiceModificationSearchRequest = {}
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          (body as Record<string, unknown>)[key] = value
        }
      })
    }
    return apiClient.post<PagedResponse<ServiceModificationDTO>>('services/admin/modifications', body)
  }
}

/**
 * Singleton instance of UserServicesService
 */
export const userServicesService = new UserServicesService()
