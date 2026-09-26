import { useQuery } from '@tanstack/react-query'
import { stockCategoriesService, type StockCategoriesListResponse } from '@/services'
import { stockKeys } from './queryKeys'

const selectCategories = (response: StockCategoriesListResponse) => response.categories || []

/**
 * Catégories du stock (GET /stock-categories → `{ success, categories }`).
 * Comme le Vue, un échec n'est pas affiché : la page s'utilise alors sans catégories (B-31).
 */
export function useStockCategoriesQuery() {
  return useQuery({
    queryKey: stockKeys.categories(),
    queryFn: () => stockCategoriesService.getCategories(),
    select: selectCategories,
  })
}
