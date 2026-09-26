import { useQuery } from '@tanstack/react-query'
import { stockItemsService, type StockItemsListResponse } from '@/services'
import { stockKeys } from './queryKeys'

const selectStockItems = (response: StockItemsListResponse) => response.stockItems || []

/** Articles du stock (GET /stock-items → `{ success, stockItems }`). */
export function useStockItemsQuery() {
  return useQuery({
    queryKey: stockKeys.items(),
    queryFn: () => stockItemsService.getStockItems(),
    select: selectStockItems,
  })
}
