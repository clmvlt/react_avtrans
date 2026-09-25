import { apiClient } from '@/api'
import type { StockItemDTO } from '@/models'
import type { SuccessMessageResponse } from '@/types'

/**
 * Stock item create request
 */
export interface StockItemCreateRequest {
  reference: string
  nom: string
  description?: string
  quantite: number
  prixUnitaire?: number
  categoryId?: string
  unite: string
}

/**
 * Stock item update request
 */
export interface StockItemUpdateRequest {
  reference?: string
  nom?: string
  description?: string
  quantite?: number
  prixUnitaire?: number
  categoryId?: string
  unite?: string
}

/**
 * Stock items list response
 */
export interface StockItemsListResponse {
  success: boolean
  stockItems: StockItemDTO[]
}

/**
 * Single stock item response
 */
export interface StockItemResponse {
  success: boolean
  message?: string
  stockItem: StockItemDTO
}

/**
 * Stock items service
 * Handles CRUD operations for stock items (parts, supplies, etc.)
 */
export class StockItemsService {
  /**
   * [MECANICIEN] Get all stock items
   * @returns Promise with list of stock items
   */
  async getStockItems(): Promise<StockItemsListResponse> {
    return apiClient.get<StockItemsListResponse>('stock-items')
  }

  /**
   * [MECANICIEN] Get stock item by UUID
   * @param uuid - Stock item UUID
   * @returns Promise with stock item details
   */
  async getStockItemById(uuid: string): Promise<StockItemResponse> {
    return apiClient.get<StockItemResponse>(`stock-items/${uuid}`)
  }

  /**
   * [MECANICIEN] Create stock item
   * @param data - Stock item data
   * @returns Promise with created stock item
   */
  async createStockItem(data: StockItemCreateRequest): Promise<StockItemResponse> {
    return apiClient.post<StockItemResponse>('stock-items', data)
  }

  /**
   * [MECANICIEN] Update stock item
   * @param uuid - Stock item UUID
   * @param data - Stock item data to update
   * @returns Promise with updated stock item
   */
  async updateStockItem(uuid: string, data: StockItemUpdateRequest): Promise<StockItemResponse> {
    return apiClient.put<StockItemResponse>(`stock-items/${uuid}`, data)
  }

  /**
   * [MECANICIEN] Delete stock item
   * @param uuid - Stock item UUID
   * @returns Promise with success message
   */
  async deleteStockItem(uuid: string): Promise<SuccessMessageResponse> {
    return apiClient.delete<SuccessMessageResponse>(`stock-items/${uuid}`)
  }
}

/**
 * Singleton instance of StockItemsService
 */
export const stockItemsService = new StockItemsService()
