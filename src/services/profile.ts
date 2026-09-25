import { apiClient } from '@/api'
import type {
  UserDTO,
  UpdateProfileRequest,
  ChangePasswordRequest
} from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * User profile service
 * Handles user profile management and password changes
 */
export class ProfileService {
  /**
   * Get own profile
   * @returns Promise with user profile (returned directly, not wrapped)
   */
  async getProfile(): Promise<UserDTO> {
    return apiClient.get<UserDTO>('profile')
  }

  /**
   * Update own profile
   * @param profileData - Profile data to update
   * @returns Promise with updated profile (returned directly, not wrapped)
   */
  async updateProfile(profileData: UpdateProfileRequest): Promise<UserDTO> {
    return apiClient.put<UserDTO>('profile', profileData)
  }

  /**
   * Change own password
   * @param passwordData - Old and new password
   * @returns Promise with success message
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<SuccessMessageResponse> {
    return apiClient.put<SuccessMessageResponse>('profile/password', passwordData)
  }
}

/**
 * Singleton instance of ProfileService
 */
export const profileService = new ProfileService()
