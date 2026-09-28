import { apiClient } from '@/api'
import type {
  VehiculeRelaiCreateRequest,
  VehiculeRelaiDTO,
  VehiculeRelaiUpdateRequest,
} from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * Véhicules relais (D9, évolution de l'API demandée par le propriétaire le 28/09/2026 : pas
 * d'équivalent dans le Vue).
 */
export interface VehiculeRelaiListResponse {
  success: boolean
  relais: VehiculeRelaiDTO[]
}

export interface VehiculeRelaiResponse {
  success: boolean
  message?: string
  relai: VehiculeRelaiDTO
}

export class VehiculeRelaisService {
  /** Historique des relais d'un véhicule, du plus récent au plus ancien. */
  async getByVehicule(vehiculeId: string): Promise<VehiculeRelaiListResponse> {
    return apiClient.get<VehiculeRelaiListResponse>(`vehicules-relais/vehicule/${vehiculeId}`)
  }

  /** [MÉCANICIEN] Déclarer un relais ; refusé s'il chevauche un autre relais du véhicule. */
  async create(data: VehiculeRelaiCreateRequest): Promise<VehiculeRelaiResponse> {
    return apiClient.post<VehiculeRelaiResponse>('vehicules-relais', data)
  }

  /** [MÉCANICIEN] Modifier ou terminer un relais (remplacement complet). */
  async update(id: string, data: VehiculeRelaiUpdateRequest): Promise<VehiculeRelaiResponse> {
    return apiClient.put<VehiculeRelaiResponse>(`vehicules-relais/${id}`, data)
  }

  /** [MÉCANICIEN] Supprimer un relais ; ses relevés redeviennent ceux du véhicule. */
  async delete(id: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`vehicules-relais/${id}`)
  }
}

export const vehiculeRelaisService = new VehiculeRelaisService()
