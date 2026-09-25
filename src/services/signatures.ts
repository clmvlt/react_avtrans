import { apiClient } from '@/api'
import type { SignatureDTO, SignatureCreateRequest, LastSignatureSummaryDTO, UserWithLastSignatureDTO } from '@/models'
import type { SuccessMessageResponse, ApiResponse } from '@/types'

/**
 * Réponse du backend pour une signature unique
 * (POST /signatures, GET /signatures/last — `signature` est null si aucune signature, avec HTTP 200)
 */
export interface SignatureResponse {
  success: boolean
  message?: string
  signature: SignatureDTO | null
}

/**
 * Réponse du backend pour une liste de signatures (GET /signatures)
 * Chaque élément contient le Base64 complet → réponse lourde
 */
export interface SignatureListResponse {
  success: boolean
  message?: string
  signatures: SignatureDTO[]
}

/**
 * Digital signatures service
 * Handles signature creation, retrieval, and management
 */
export class SignaturesService {
  /**
   * Create a signature
   * @param data - Signature data ({ signatureBase64, date, heuresSignees })
   * @returns Promise with created signature
   */
  async createSignature(data: SignatureCreateRequest): Promise<SignatureResponse> {
    return apiClient.post<SignatureResponse>('signatures', data)
  }

  /**
   * Get all my signatures
   * @returns Promise with list of signatures
   */
  async getSignatures(): Promise<SignatureListResponse> {
    return apiClient.get<SignatureListResponse>('signatures')
  }

  /**
   * Get my last signature with Base64 image
   * @returns Promise with last signature (includes full image data)
   */
  async getLastSignature(): Promise<SignatureResponse> {
    return apiClient.get<SignatureResponse>('signatures/last')
  }

  /**
   * Get my last signature summary (without Base64 image).
   * Le backend renvoie un objet plat : { date, heuresSignees, needsToSign, heuresLastMonth }.
   * `needsToSign` vaut true si l'utilisateur a fait des heures le mois dernier
   * et n'a pas encore signé ce mois-ci — quel que soit son rôle.
   * @returns Promise with last signature summary
   */
  async getLastSignatureSummary(): Promise<LastSignatureSummaryDTO> {
    return apiClient.get<LastSignatureSummaryDTO>('signatures/last/summary')
  }

  /**
   * Get signature history for current user
   * @returns Promise with list of signatures
   */
  async getSignatureHistory(): Promise<SignatureListResponse> {
    return this.getSignatures()
  }

  // Admin methods

  /**
   * [ADMIN] Get all users with their last signature
   * @returns Promise with list of users and their last signatures
   */
  async getAllSignatures(): Promise<ApiResponse<UserWithLastSignatureDTO[]>> {
    return apiClient.get<ApiResponse<UserWithLastSignatureDTO[]>>('signatures/all-users')
  }

  /**
   * [ADMIN] Get signatures for a specific user
   * @param userUuid - User UUID
   * @returns Promise with list of user signatures
   */
  async getUserSignatures(userUuid: string): Promise<ApiResponse<SignatureDTO[]>> {
    return apiClient.get<ApiResponse<SignatureDTO[]>>(`signatures/user/${userUuid}`)
  }

  /**
   * [ADMIN] Delete signature
   * @param signatureUuid - Signature UUID
   * @returns Promise with success message
   */
  async deleteSignature(signatureUuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`signatures/${signatureUuid}`)
  }
}

/**
 * Singleton instance of SignaturesService
 */
export const signaturesService = new SignaturesService()
