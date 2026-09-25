import type { ApiRequestConfig, ErrorResponse } from '@/types'

/**
 * Custom API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static fromErrorResponse(error: ErrorResponse): ApiError {
    return new ApiError(
      error.message,
      error.status,
      error.code,
      error.details
    )
  }
}

/**
 * Type for request interceptor function
 */
export type RequestInterceptor = (config: RequestInit & { url: string }) => RequestInit & { url: string } | Promise<RequestInit & { url: string }>

/**
 * Type for response interceptor function
 */
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>

/**
 * Configuration options for ApiClient
 */
export interface ApiClientConfig {
  /** Base URL for all API requests */
  baseURL: string
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>
  /** Default timeout in milliseconds */
  timeout?: number
  /** Request interceptors */
  requestInterceptors?: RequestInterceptor[]
  /** Response interceptors */
  responseInterceptors?: ResponseInterceptor[]
}

/**
 * Generic HTTP client for API requests with TypeScript support
 */
export class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private timeout: number
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL
    this.defaultHeaders = config.defaultHeaders || {}
    this.timeout = config.timeout || 30000
    this.requestInterceptors = config.requestInterceptors || []
    this.responseInterceptors = config.responseInterceptors || []
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Build query string from parameters
   */
  private buildQueryString(params?: Record<string, string | number | boolean>): string {
    if (!params || Object.keys(params).length === 0) {
      return ''
    }

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value))
    })

    return `?${searchParams.toString()}`
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(
    config: RequestInit & { url: string }
  ): Promise<RequestInit & { url: string }> {
    let finalConfig = config

    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig)
    }

    return finalConfig
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let finalResponse = response

    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse)
    }

    return finalResponse
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    // Handle empty responses (204, 205)
    if (response.status === 204 || response.status === 205) {
      return { success: true } as T
    }

    // Handle JSON responses
    if (contentType?.includes('application/json')) {
      return await response.json()
    }

    // Handle text responses
    if (contentType?.includes('text/plain')) {
      const text = await response.text()
      try {
        return JSON.parse(text) as T
      } catch {
        return { message: text, success: response.ok } as T
      }
    }

    // Default: try to parse as JSON
    const text = await response.text()
    if (!text) {
      return { success: response.ok } as T
    }

    try {
      return JSON.parse(text) as T
    } catch {
      return { message: text, success: response.ok } as T
    }
  }

  /**
   * Main request method with full TypeScript support
   */
  async request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}${this.buildQueryString(config.params)}`

    const headers: Record<string, string> = {
      'Content-Type': config.contentType || 'application/json',
      'Accept': 'application/json',
      ...this.defaultHeaders,
      ...config.headers
    }

    const requestConfig: RequestInit & { url: string } = {
      url,
      method: config.method || 'GET',
      headers
    }

    if (config.body) {
      requestConfig.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body)
    }

    try {
      // Apply request interceptors
      const finalConfig = await this.applyRequestInterceptors(requestConfig)
      const { url: finalUrl, ...fetchConfig } = finalConfig

      // Create abort controller for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.timeout)

      // Make the request
      let response = await fetch(finalUrl, {
        ...fetchConfig,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Apply response interceptors
      response = await this.applyResponseInterceptors(response)

      // Parse response
      const data = await this.parseResponse<T>(response)

      // Check if response is ok
      if (!response.ok) {
        const errorData = data as unknown as ErrorResponse
        // 400 "Validation error" : l'API joint un tableau `errors` ("champ: message").
        // On l'intègre au message pour que l'UI affiche quelque chose d'exploitable.
        const validationErrors = Array.isArray(errorData.errors) ? errorData.errors : undefined
        const baseMessage = errorData.message || 'Une erreur s\'est produite'
        const message = validationErrors && validationErrors.length > 0
          ? `${baseMessage} : ${validationErrors.join(' ; ')}`
          : baseMessage
        throw ApiError.fromErrorResponse({
          message,
          status: response.status,
          code: errorData.code,
          details: validationErrors ?? errorData.details
        })
      }

      return data

    } catch (error) {
      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'TIMEOUT')
      }

      // Handle API errors
      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError('Network error', 0, 'NETWORK_ERROR', error.message)
      }

      // Handle unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        500,
        'UNKNOWN_ERROR',
        error
      )
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: unknown, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}
