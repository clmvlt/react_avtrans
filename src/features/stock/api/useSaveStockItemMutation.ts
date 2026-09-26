import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stockItemsService, type StockItemCreateRequest } from '@/services'
import { updateStockItemsCache } from './stockCache'

type SaveStockItemVariables = {
  /** Identifiant de l'article en modification ; absent en création. */
  id?: string
  data: StockItemCreateRequest
}

/**
 * Création (POST /stock-items) ou modification (PUT /stock-items/{id}) d'un article.
 * Comme le Vue : l'article renvoyé est ajouté en fin de liste ou remplace l'ancien, sans recharger.
 * Un `categoryId` absent est ignoré par l'API : impossible de déclasser un article (MIGRATION.md 8.3).
 */
export function useSaveStockItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: SaveStockItemVariables) =>
      id ? stockItemsService.updateStockItem(id, data) : stockItemsService.createStockItem(data),
    onSuccess: (response, { id }) => {
      const saved = response.stockItem
      if (!saved) return
      updateStockItemsCache(queryClient, (items) =>
        id ? items.map((item) => (item.id === id ? saved : item)) : [...items, saved],
      )
    },
  })
}
