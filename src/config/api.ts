/**
 * API Configuration
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.120:8081/'

/**
 * Local storage key for JWT token
 */
export const TOKEN_STORAGE_KEY = 'auth_token'

/**
 * Get the authentication token from local storage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Set the authentication token in local storage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Remove the authentication token from local storage
 */
export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}
