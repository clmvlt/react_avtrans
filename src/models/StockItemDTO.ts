import type { StockCategoryDTO } from './StockCategoryDTO'

export interface StockItemDTO {
  id?: string
  reference?: string
  nom?: string
  description?: string
  quantite?: number
  prixUnitaire?: number
  category?: StockCategoryDTO
  unite?: string
  createdAt?: string
  updatedAt?: string
}
