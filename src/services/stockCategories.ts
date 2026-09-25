import { apiClient } from '@/api'
import type { StockCategoryDTO } from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * Stock category create request
 */
export interface StockCategoryCreateRequest {
  nom: string
  description?: string
}

/**
 * Stock category update request
 */
export interface StockCategoryUpdateRequest {
  nom?: string
  description?: string
}

/**
 * Stock categories list response
 */
export interface StockCategoriesListResponse {
  success: boolean
  categories: StockCategoryDTO[]
}

/**
 * Single stock category response
 */
export interface StockCategoryResponse {
  success: boolean
  message?: string
  category: StockCategoryDTO
}

/**
 * Stock categories service
 * Handles CRUD operations for stock categories
 */
export class StockCategoriesService {
  /**
   * [MECANICIEN] Get all stock categories
   * @returns Promise with list of categories
   */
  async getCategories(): Promise<StockCategoriesListResponse> {
    return apiClient.get<StockCategoriesListResponse>('stock-categories')
  }

  /**
   * [MECANICIEN] Get category by UUID
   * @param uuid - Category UUID
   * @returns Promise with category details
   */
  async getCategoryById(uuid: string): Promise<StockCategoryResponse> {
    return apiClient.get<StockCategoryResponse>(`stock-categories/${uuid}`)
  }

  /**
   * [MECANICIEN] Create stock category
   * @param data - Category data
   * @returns Promise with created category
   */
  async createCategory(data: StockCategoryCreateRequest): Promise<StockCategoryResponse> {
    return apiClient.post<StockCategoryResponse>('stock-categories', data)
  }

  /**
   * [MECANICIEN] Update stock category
   * @param uuid - Category UUID
   * @param data - Category data to update
   * @returns Promise with updated category
   */
  async updateCategory(uuid: string, data: StockCategoryUpdateRequest): Promise<StockCategoryResponse> {
    return apiClient.put<StockCategoryResponse>(`stock-categories/${uuid}`, data)
  }

  /**
   * [MECANICIEN] Delete stock category
   * @param uuid - Category UUID
   * @returns Promise with success message
   */
  async deleteCategory(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`stock-categories/${uuid}`)
  }
}

/**
 * Singleton instance of StockCategoriesService
 */
export const stockCategoriesService = new StockCategoriesService()
