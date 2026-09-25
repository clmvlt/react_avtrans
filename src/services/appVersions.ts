import { apiClient } from '@/api'
import { API_URL } from '@/config/api'
import type {
  AppVersionListResponse,
  AppVersionResponse,
  AppVersionCheckResponse,
  CreateAppVersionRequest,
  UpdateAppVersionRequest,
  AppVersionSuccessResponse
} from '@/models'

/**
 * Service de gestion des versions d'application mobile
 * Gère les opérations CRUD et le téléchargement des APK
 */
export class AppVersionsService {
  // ==================== Routes publiques (pas d'auth requise) ====================

  /**
   * Récupère toutes les versions actives
   * @returns Promise avec la liste des versions actives
   */
  async getActiveVersions(): Promise<AppVersionListResponse> {
    return apiClient.get<AppVersionListResponse>('app-versions')
  }

  /**
   * Récupère la dernière version active
   * @returns Promise avec la dernière version
   */
  async getLatestVersion(): Promise<AppVersionResponse> {
    return apiClient.get<AppVersionResponse>('app-versions/latest')
  }

  /**
   * Vérifie si une mise à jour est disponible
   * @param currentVersion - Code de version actuellement installé
   * @returns Promise avec les informations de mise à jour
   */
  async checkForUpdate(currentVersion: number): Promise<AppVersionCheckResponse> {
    return apiClient.get<AppVersionCheckResponse>(`app-versions/check?currentVersion=${currentVersion}`)
  }

  /**
   * Récupère les informations d'une version par son ID
   * @param id - UUID de la version
   * @returns Promise avec les détails de la version
   */
  async getVersionById(id: string): Promise<AppVersionResponse> {
    return apiClient.get<AppVersionResponse>(`app-versions/${id}`)
  }

  /**
   * Retourne l'URL de téléchargement d'une version spécifique
   * @param id - UUID de la version
   * @returns URL de téléchargement
   */
  getDownloadUrl(id: string): string {
    return `${API_URL}app-versions/${id}/download`
  }

  /**
   * Retourne l'URL de téléchargement de la dernière version
   * @returns URL de téléchargement
   */
  getLatestDownloadUrl(): string {
    return `${API_URL}app-versions/latest/download`
  }

  // ==================== Routes admin ====================

  /**
   * [ADMIN] Récupère toutes les versions (actives et inactives)
   * @returns Promise avec la liste de toutes les versions
   */
  async getAllVersions(): Promise<AppVersionListResponse> {
    return apiClient.get<AppVersionListResponse>('app-versions/admin')
  }

  /**
   * [ADMIN] Crée une nouvelle version
   * @param data - Données de la nouvelle version (APK en base64)
   * @returns Promise avec la version créée
   */
  async createVersion(data: CreateAppVersionRequest): Promise<AppVersionResponse> {
    return apiClient.post<AppVersionResponse>('app-versions', data)
  }

  /**
   * [ADMIN] Met à jour les métadonnées d'une version
   * @param id - UUID de la version
   * @param data - Données à mettre à jour
   * @returns Promise avec la version mise à jour
   */
  async updateVersion(id: string, data: UpdateAppVersionRequest): Promise<AppVersionResponse> {
    return apiClient.put<AppVersionResponse>(`app-versions/${id}`, data)
  }

  /**
   * [ADMIN] Supprime une version
   * @param id - UUID de la version
   * @returns Promise avec le message de succès
   */
  async deleteVersion(id: string): Promise<AppVersionSuccessResponse> {
    return apiClient.delete<AppVersionSuccessResponse>(`app-versions/${id}`)
  }
}

/**
 * Instance singleton du service AppVersionsService
 */
export const appVersionsService = new AppVersionsService()
