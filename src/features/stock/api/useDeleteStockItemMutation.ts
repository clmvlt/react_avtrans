import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stockItemsService } from '@/services'
import { updateStockItemsCache } from './stockCache'

/** Suppression d'un article (DELETE /stock-items/{id}), retiré de la liste sans recharger. */
export function useDeleteStockItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockItemsService.deleteStockItem(id),
    onSuccess: (_response, id) => {
      updateStockItemsCache(queryClient, (items) => items.filter((item) => item.id !== id))
    },
  })
}
