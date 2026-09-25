/**
 * Common API types and response wrappers
 */

/**
 * Standard error response from the API
 */
export interface ErrorResponse {
  /** Error message describing what went wrong */
  message: string
  /** HTTP status code */
  status?: number
  /** Error code for programmatic handling */
  code?: string
  /** Additional error details */
  details?: unknown
  /** Timestamp when the error occurred */
  timestamp?: string
  /**
   * Erreurs de validation (400 "Validation error" côté API).
   * Format : "champ: message" (ex. "montant: Le montant doit être positif")
   */
  errors?: string[]
}

/**
 * Standard success message response
 */
export interface SuccessMessageResponse {
  /** Success message */
  message: string
  /** Indicates operation was successful */
  success: boolean
}

/**
 * Paginated response wrapper
 */
export interface PagedResponse<T> {
  /** Array of items for the current page */
  content: T[]
  /** Current page number (0-indexed) */
  page: number
  /** Number of items per page */
  size: number
  /** Total number of items across all pages */
  totalElements: number
  /** Total number of pages */
  totalPages: number
  /** Whether this is the first page */
  first: boolean
  /** Whether this is the last page */
  last: boolean
  /** Whether the page has content (absent côté API AVTrans, conservé pour compatibilité) */
  empty?: boolean
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data?: T
  /** Success indicator */
  success: boolean
  /** Optional message */
  message?: string
  /** Error details if request failed */
  error?: ErrorResponse
  // Specific fields for different endpoints
  /** Types entretien list (from GET /types-entretien) */
  typesEntretien?: T
  /** Single type entretien (from POST/PUT /types-entretien) */
  typeEntretien?: T extends Array<infer U> ? U : T
  /** Vehicle types entretien list (from GET /vehicules-types-entretien/vehicule/{id}) */
  vehiculeTypesEntretien?: T
  /** Single vehicle type entretien (from POST/PUT /vehicules-types-entretien) */
  vehiculeTypeEntretien?: T extends Array<infer U> ? U : T
  /** Notifications list (from GET /notifications) */
  notifications?: T
  /** Single notification (from GET /notifications/{uuid}) */
  notification?: T extends Array<infer U> ? U : T
}

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * API request configuration
 */
export interface ApiRequestConfig {
  /** HTTP method */
  method?: HttpMethod
  /** Request headers */
  headers?: Record<string, string>
  /** Request body */
  body?: unknown
  /** Query parameters */
  params?: Record<string, string | number | boolean>
  /** Request timeout in milliseconds */
  timeout?: number
  /** Content type override */
  contentType?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (0-indexed) */
  page?: number
  /** Items per page */
  size?: number
  /** Sort field */
  sort?: string
  /** Sort direction */
  direction?: 'ASC' | 'DESC'
}

/**
 * Date range filter
 */
export interface DateRange {
  /** Start date (ISO 8601 format or Date object) */
  startDate?: string | Date
  /** End date (ISO 8601 format or Date object) */
  endDate?: string | Date
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'message' in response &&
    typeof (response as ErrorResponse).message === 'string'
  )
}

/**
 * Type guard to check if response is paginated
 */
export function isPagedResponse<T>(response: unknown): response is PagedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'content' in response &&
    Array.isArray((response as PagedResponse<T>).content) &&
    'page' in response &&
    'totalElements' in response
  )
}
