import type { AuthUserDTO } from './UserDTO'

/**
 * Login request
 */
export interface LoginRequest {
  email?: string
  password?: string
}

/**
 * Login response
 */
export interface LoginResponse {
  /** Success flag */
  success: boolean
  /** Response message */
  message: string
  /** User information with authentication token */
  user: AuthUserDTO
  /** Token expiration time in milliseconds */
  expiresIn?: number
  /** JWT authentication token (deprecated - now in user object) */
  token?: string
}

/**
 * Profil Google renvoyé par POST /auth/google quand le compte n'existe pas
 * encore (status NEEDS_REGISTRATION). Sert au pré-remplissage de la page de
 * création de compte.
 */
export interface GoogleProfile {
  email?: string
  firstName?: string
  lastName?: string
  pictureUrl?: string
}

/** Statut renvoyé par POST /auth/google. */
export type GoogleAuthStatus = 'AUTHENTICATED' | 'NEEDS_REGISTRATION'

/**
 * Réponse de POST /auth/google.
 * - AUTHENTICATED → `user` présent (avec token), connecter l'utilisateur.
 * - NEEDS_REGISTRATION → `googleProfile` présent, rediriger vers la création.
 */
export interface GoogleAuthResponse {
  success: boolean
  message?: string
  status: GoogleAuthStatus
  /** Présent quand status === 'AUTHENTICATED'. */
  user?: AuthUserDTO
  /** Présent quand status === 'NEEDS_REGISTRATION'. */
  googleProfile?: GoogleProfile
  /** Token JWT (compatibilité — normalement dans user). */
  token?: string
  /** Durée de validité du token en ms. */
  expiresIn?: number
}

/**
 * Requête de POST /auth/google/register.
 * email et pictureUrl ne sont PAS envoyés : le backend les lit depuis le token.
 */
export interface GoogleRegisterRequest {
  idToken: string
  firstName?: string
  lastName?: string
}

/**
 * Réponse de POST /auth/google/register.
 * status PENDING_ACTIVATION → compte créé, en attente d'activation admin
 * (aucun token renvoyé, l'utilisateur n'est pas connecté).
 */
export interface GoogleRegisterResponse {
  success: boolean
  status: 'PENDING_ACTIVATION'
  message?: string
}

/**
 * Register request
 */
export interface RegisterRequest {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
}

/**
 * Password reset request DTO
 */
export interface PasswordResetRequestDTO {
  email?: string
}

/**
 * Password reset confirm DTO
 */
export interface PasswordResetConfirmDTO {
  token?: string
  newPassword?: string
}

/**
 * Export request - Requête d'export des heures de travail
 */
export interface ExportRequest {
  /** Liste des UUIDs des utilisateurs à exporter */
  userUuids?: string[]
  /** Date de début de la période */
  startDate?: string
  /** Date de fin de la période */
  endDate?: string
}

/**
 * Register response - Réponse d'inscription
 */
export interface RegisterResponse {
  /** Indique si l'opération a réussi */
  success: boolean
  /** Message décrivant le résultat */
  message: string
  /** UUID de l'utilisateur créé */
  userId?: string
}

/**
 * Email verification response - Réponse de vérification d'email
 */
export interface EmailVerificationResponse {
  /** Indique si l'opération a réussi */
  success: boolean
  /** Message décrivant le résultat */
  message: string
  /** Email vérifié */
  email?: string
}
