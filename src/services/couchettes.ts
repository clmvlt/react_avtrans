import { apiClient } from '@/api'
import type { CouchetteDTO, CouchetteCreateRequest, AdminCouchetteCreateRequest } from '@/models'
import type { SuccessMessageResponse, ApiResponse, PagedResponse } from '@/types'

/**
 * Paramètres de recherche de couchettes
 */
export interface CouchetteSearchParams {
  /** UUID de l'utilisateur (filtre optionnel) */
  userUuid?: string
  /** Date de début de recherche */
  startDate?: string
  /** Date de fin de recherche */
  endDate?: string
  /** Numéro de page (commence à 0) */
  page?: number
  /** Nombre d'éléments par page */
  size?: number
  /** Champ de tri */
  sortBy?: string
  /** Direction du tri */
  sortDirection?: 'asc' | 'desc'
}

/**
 * Service de gestion des couchettes
 * Permet aux utilisateurs de déclarer leurs nuits en couchette
 */
export class CouchettesService {
  // =========================================
  // Méthodes utilisateur
  // =========================================

  /**
   * Créer une couchette pour soi-même
   * POST /couchettes — renvoie le CouchetteDTO NU (pas d'enveloppe `success`).
   * 400 : "L'utilisateur n'a pas la permission couchette" | "Une couchette existe déjà pour cette date"
   * @param data - Données de la couchette (date optionnelle, défaut = aujourd'hui)
   * @returns Promise avec la couchette créée
   */
  async createCouchette(data?: CouchetteCreateRequest): Promise<CouchetteDTO> {
    return apiClient.post<CouchetteDTO>('couchettes', data || {})
  }

  /**
   * Récupérer mes couchettes avec pagination
   * @param params - Paramètres de recherche et pagination
   * @returns Promise avec la liste paginée de mes couchettes
   */
  async getMyCouchettes(params?: CouchetteSearchParams): Promise<PagedResponse<CouchetteDTO>> {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append('page', params.page.toString())
    if (params?.size !== undefined) queryParams.append('size', params.size.toString())
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ''
    return apiClient.get<PagedResponse<CouchetteDTO>>(`couchettes/me${queryString}`)
  }

  /**
   * Supprimer une de mes couchettes (doit m'appartenir ET être datée d'aujourd'hui)
   * DELETE /couchettes/{uuid} — 204 No Content (corps vide, ApiClient renvoie { success: true })
   * @param uuid - UUID de la couchette à supprimer
   * @returns Promise avec message de succès
   */
  async deleteMyCouchette(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`couchettes/${uuid}`)
  }

  // =========================================
  // Méthodes admin
  // =========================================

  /**
   * [ADMIN] Rechercher et filtrer les couchettes avec pagination
   * @param params - Paramètres de recherche et pagination
   * @returns Promise avec la liste paginée de toutes les couchettes
   */
  async getAllCouchettes(params?: CouchetteSearchParams): Promise<PagedResponse<CouchetteDTO>> {
    const searchParams: CouchetteSearchParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      sortBy: params?.sortBy ?? 'date',
      sortDirection: params?.sortDirection ?? 'desc',
      ...(params?.userUuid && { userUuid: params.userUuid }),
      ...(params?.startDate && { startDate: params.startDate }),
      ...(params?.endDate && { endDate: params.endDate })
    }
    return apiClient.post<PagedResponse<CouchetteDTO>>('couchettes/admin/search', searchParams)
  }

  /**
   * [ADMIN] Créer une couchette pour un utilisateur
   * @param data - Données incluant l'UUID de l'utilisateur
   * @returns Promise avec la couchette créée
   */
  async createCouchetteForUser(data: AdminCouchetteCreateRequest): Promise<ApiResponse<CouchetteDTO>> {
    return apiClient.post<ApiResponse<CouchetteDTO>>('couchettes/admin', data)
  }

  /**
   * [ADMIN] Supprimer n'importe quelle couchette
   * @param uuid - UUID de la couchette à supprimer
   * @returns Promise avec message de succès
   */
  async deleteCouchette(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`couchettes/admin/${uuid}`)
  }
}

/**
 * Instance singleton du service de couchettes
 */
export const couchettesService = new CouchettesService()
