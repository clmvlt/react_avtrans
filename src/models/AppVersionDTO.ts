/**
 * DTO représentant une version d'application mobile
 */
export interface AppVersionDTO {
  id: string
  versionCode: number
  versionName: string
  originalFileName: string
  fileSize: number
  changelog?: string
  isActive: boolean
  downloadCount: number
  downloadUrl: string
  createdAt: string
  createdByUuid?: string
  createdByName?: string
}

/**
 * Réponse API pour la liste des versions
 */
export interface AppVersionListResponse {
  success: boolean
  versions: AppVersionDTO[]
}

/**
 * Réponse API pour une version unique
 */
export interface AppVersionResponse {
  success: boolean
  message?: string
  version: AppVersionDTO
}

/**
 * Réponse API pour la vérification de mise à jour
 */
export interface AppVersionCheckResponse {
  success: boolean
  updateAvailable: boolean
  currentVersionCode: number
  /** null si aucune version active */
  latestVersionCode: number | null
  /** Non null UNIQUEMENT si updateAvailable === true */
  latestVersion: AppVersionDTO | null
}

/**
 * Requête pour créer une nouvelle version
 */
export interface CreateAppVersionRequest {
  apkB64: string
  versionCode: number
  versionName: string
  originalFileName: string
  changelog?: string
}

/**
 * Requête pour mettre à jour une version
 */
export interface UpdateAppVersionRequest {
  changelog?: string
  isActive?: boolean
}

/**
 * Réponse API générique avec message de succès
 */
export interface AppVersionSuccessResponse {
  success: boolean
  message: string
}
