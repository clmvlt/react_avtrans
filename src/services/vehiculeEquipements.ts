import { apiClient } from '@/api'
import type { VehiculeEquipementDTO } from '@/models'
import type { SuccessMessageResponse } from '@/types'

export interface VehiculeEquipementCreateRequest {
  vehiculeId: string
  nom: string
  quantite?: number
  commentaire?: string
}

export interface VehiculeEquipementUpdateRequest {
  nom?: string
  quantite?: number
  commentaire?: string
}

export interface VehiculeEquipementListResponse {
  success: boolean
  equipements: VehiculeEquipementDTO[]
}

export interface VehiculeEquipementResponse {
  success: boolean
  message?: string
  equipement: VehiculeEquipementDTO
}

export class VehiculeEquipementsService {
  async getByVehicule(vehiculeId: string): Promise<VehiculeEquipementListResponse> {
    return apiClient.get<VehiculeEquipementListResponse>(`vehicules-equipements/vehicule/${vehiculeId}`)
  }

  async getById(id: string): Promise<VehiculeEquipementResponse> {
    return apiClient.get<VehiculeEquipementResponse>(`vehicules-equipements/${id}`)
  }

  async create(data: VehiculeEquipementCreateRequest): Promise<VehiculeEquipementResponse> {
    return apiClient.post<VehiculeEquipementResponse>('vehicules-equipements', data)
  }

  async update(id: string, data: VehiculeEquipementUpdateRequest): Promise<VehiculeEquipementResponse> {
    return apiClient.put<VehiculeEquipementResponse>(`vehicules-equipements/${id}`, data)
  }

  async delete(id: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`vehicules-equipements/${id}`)
  }
}

export const vehiculeEquipementsService = new VehiculeEquipementsService()
