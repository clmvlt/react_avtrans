import { apiClient } from '@/api'
import type {
  UserDTO,
  UpdateUserRequest,
  UserWithStatusDTO,
  UserWithHoursDTO,
  UserLastKilometrageResponse,
  UserLastVehicleDTO,
  NotificationPreferencesDTO,
  UpdateNotificationPreferencesRequest,
  UsersContractComparisonListResponse,
  UserContractComparisonResponse
} from '@/models'
import type { SuccessMessageResponse, ApiResponse } from '@/types'

/**
 * Response type for getUsersWithHours endpoint
 */
interface UsersWithHoursResponse {
  success: boolean
  message: string
  users: UserWithHoursDTO[]
}

/**
 * User management service (Admin only)
 * Handles CRUD operations for users and user status/hours queries
 */
export class UsersService {
  /**
   * Get all users
   * @returns Promise with list of users
   */
  async getUsers(): Promise<ApiResponse<UserDTO[]>> {
    return apiClient.get<ApiResponse<UserDTO[]>>('users')
  }

  /**
   * Get user by UUID
   * @param uuid - User UUID
   * @returns Promise with user details
   */
  async getUserById(uuid: string): Promise<ApiResponse<UserDTO>> {
    return apiClient.get<ApiResponse<UserDTO>>(`users/${uuid}`)
  }

  /**
   * Update user
   * @param uuid - User UUID
   * @param userData - User data to update
   * @returns Promise with API response containing the updated user
   */
  async updateUser(uuid: string, userData: UpdateUserRequest): Promise<{ success: boolean; message: string; user: UserDTO }> {
    return apiClient.put<{ success: boolean; message: string; user: UserDTO }>(`users/${uuid}`, userData)
  }

  /**
   * Delete user
   * @param uuid - User UUID
   * @returns Promise with success message
   */
  async deleteUser(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`users/${uuid}`)
  }

  /**
   * Get all users with their presence status and hours worked today
   * @returns Promise with list of users with status (direct array, not wrapped in ApiResponse)
   */
  async getUsersWithStatus(): Promise<UserWithStatusDTO[]> {
    return apiClient.get<UserWithStatusDTO[]>('users/status')
  }

  /**
   * Get all users with their worked hours (day, week, month, year, last month)
   * @returns Promise with list of users with worked hours
   */
  async getUsersWithHours(): Promise<UsersWithHoursResponse> {
    return apiClient.get<UsersWithHoursResponse>('users/hours')
  }

  /**
   * Get current user's last kilometrage entry
   * GET /users/me/kilometrage — DTO nu { lastKilometrage, hasEnteredToday }
   * @returns Promise with last kilometrage and whether user has entered today
   */
  async getMyLastKilometrage(): Promise<UserLastKilometrageResponse> {
    return apiClient.get<UserLastKilometrageResponse>('users/me/kilometrage')
  }

  /**
   * Get current user's notification preferences
   * GET /users/me/notification-preferences — renvoie le DTO NU (pas d'enveloppe `success`/`data`)
   * @returns Promise with notification preferences
   */
  async getMyNotificationPreferences(): Promise<NotificationPreferencesDTO> {
    return apiClient.get<NotificationPreferencesDTO>('users/me/notification-preferences')
  }

  /**
   * Update current user's notification preferences
   * PUT /users/me/notification-preferences — seules les clés non nulles sont modifiées.
   * Valeurs strictement NONE | SITE | EMAIL (autre → 400 "Invalid JSON format").
   * Renvoie le DTO NU à jour.
   * @param preferences - Notification preferences to update
   * @returns Promise with updated notification preferences
   */
  async updateMyNotificationPreferences(
    preferences: UpdateNotificationPreferencesRequest
  ): Promise<NotificationPreferencesDTO> {
    return apiClient.put<NotificationPreferencesDTO>(
      'users/me/notification-preferences',
      preferences
    )
  }

  /**
   * [ADMIN] Get last vehicle used per user
   * @returns Promise with array of last vehicle info per user
   */
  async getUsersLastVehicles(): Promise<UserLastVehicleDTO[]> {
    return apiClient.get<UserLastVehicleDTO[]>('users/last-vehicles')
  }

  /**
   * [ADMIN] Get contract hours comparison for all users
   * @param year - Year (defaults to current)
   * @param month - Month (defaults to current)
   */
  async getContractComparison(year?: number, month?: number): Promise<UsersContractComparisonListResponse> {
    const params = new URLSearchParams()
    if (year != null) params.set('year', String(year))
    if (month != null) params.set('month', String(month))
    const query = params.toString()
    return apiClient.get<UsersContractComparisonListResponse>(`users/contract-hours${query ? `?${query}` : ''}`)
  }

  /**
   * [ADMIN] Get contract hours comparison for a specific user
   * @param uuid - User UUID
   * @param year - Year (defaults to current)
   * @param month - Month (defaults to current)
   */
  async getUserContractComparison(uuid: string, year?: number, month?: number): Promise<UserContractComparisonResponse> {
    const params = new URLSearchParams()
    if (year != null) params.set('year', String(year))
    if (month != null) params.set('month', String(month))
    const query = params.toString()
    return apiClient.get<UserContractComparisonResponse>(`users/${uuid}/contract-hours${query ? `?${query}` : ''}`)
  }

  /**
   * Resend verification email with updated email address
   * Updates user email address (normalized to lowercase), sets isMailVerified to false,
   * and sends a new verification email
   * @param uuid - User UUID
   * @param email - New email address for the user
   * @returns Promise with updated user data
   */
  async resendVerificationEmail(uuid: string, email: string): Promise<{ success: boolean; message: string; user: UserDTO }> {
    return apiClient.post<{ success: boolean; message: string; user: UserDTO }>(
      `users/${uuid}/resend-verification`,
      { email },
      { timeout: 60000 }
    )
  }
}

/**
 * Singleton instance of UsersService
 */
export const usersService = new UsersService()
