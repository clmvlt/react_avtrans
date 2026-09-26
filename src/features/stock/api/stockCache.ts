import type { QueryClient } from '@tanstack/react-query'
import type { StockCategoryDTO, StockItemDTO } from '@/models'
import type { StockCategoriesListResponse, StockItemsListResponse } from '@/services'
import { stockKeys } from './queryKeys'

/**
 * Mises à jour locales du cache, équivalentes aux modifications de tableaux du Vue
 * (`push`, remplacement, `filter`) : pas de nouveau GET là où le Vue n'en faisait pas.
 */
export function updateStockItemsCache(
  queryClient: QueryClient,
  updater: (items: StockItemDTO[]) => StockItemDTO[],
) {
  queryClient.setQueryData<StockItemsListResponse>(stockKeys.items(), (old) =>
    old ? { ...old, stockItems: updater(old.stockItems || []) } : old,
  )
}

export function updateStockCategoriesCache(
  queryClient: QueryClient,
  updater: (categories: StockCategoryDTO[]) => StockCategoryDTO[],
) {
  queryClient.setQueryData<StockCategoriesListResponse>(stockKeys.categories(), (old) =>
    old ? { ...old, categories: updater(old.categories || []) } : old,
  )
}
