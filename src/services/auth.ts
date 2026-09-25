import { apiClient } from '@/api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  EmailVerificationResponse,
  PasswordResetConfirmDTO,
  ExportRequest,
  GoogleAuthResponse,
  GoogleRegisterRequest,
  GoogleRegisterResponse
} from '@/models'
import type { SuccessMessageResponse } from '@/types'
import { setAuthToken, clearAuthToken } from '@/config/api'

/**
 * Authentication service
 * Handles user authentication, registration, and password management
 */
export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>('auth/register', userData)
  }

  /**
   * Verify email with token
   * Uses extended timeout (60s) for production environments where this may take longer
   */
  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    return apiClient.get<EmailVerificationResponse>('auth/verify', {
      params: { token },
      timeout: 60000
    })
  }

  /**
   * Login user and store authentication token
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('auth/login', credentials)

    // Store the authentication token (check both locations for compatibility)
    const token = response.user?.token || response.token
    if (token) {
      setAuthToken(token)
    }

    return response
  }

  /**
   * Étape 1 — Authentification via un ID token Google.
   * Renvoie un statut discriminé :
   * - AUTHENTICATED → user + token présents, on stocke le token (comme login()).
   * - NEEDS_REGISTRATION → googleProfile présent, aucun token (création requise).
   */
  async loginWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
    const response = await apiClient.post<GoogleAuthResponse>('auth/google', { idToken })

    if (response.status === 'AUTHENTICATED') {
      const token = response.user?.token || response.token
      if (token) {
        setAuthToken(token)
      }
    }

    return response
  }

  /**
   * Étape 2 — Création d'un compte via Google.
   * Le backend lit email + photo depuis l'idToken ; on n'envoie que les noms.
   * Aucun token renvoyé : le compte doit être activé par un administrateur.
   */
  async registerWithGoogle(data: GoogleRegisterRequest): Promise<GoogleRegisterResponse> {
    return apiClient.post<GoogleRegisterResponse>('auth/google/register', data)
  }

  /**
   * Get current authenticated user — GET /auth/me
   * Route sans @RequireRole : ne vérifie ni isActive ni le rôle.
   * Token invalide → 400 (pas 401) "Token invalide" ; header absent → 500.
   * Préférer profileService.getProfile() (401 propre + vérifie isActive) pour rafraîchir le profil.
   */
  async getMe(): Promise<LoginResponse> {
    return apiClient.get<LoginResponse>('auth/me')
  }

  /**
   * Logout user and clear authentication token
   */
  logout(): void {
    clearAuthToken()
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<SuccessMessageResponse> {
    return apiClient.post<SuccessMessageResponse>('auth/password-reset/request', { email })
  }

  /**
   * Confirm password reset with token and new password
   */
  async confirmPasswordReset(data: PasswordResetConfirmDTO): Promise<SuccessMessageResponse> {
    return apiClient.post<SuccessMessageResponse>('auth/password-reset/confirm', data)
  }

  /**
   * Export data (requires authentication)
   */
  async exportData(request: ExportRequest): Promise<Blob> {
    const response = await apiClient.post<Blob>('auth/export', request, {
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    })

    return response
  }
}

/**
 * Singleton instance of AuthService
 */
export const authService = new AuthService()
