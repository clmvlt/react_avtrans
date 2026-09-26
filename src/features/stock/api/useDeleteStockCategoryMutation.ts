import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stockCategoriesService } from '@/services'
import { stockKeys } from './queryKeys'
import { updateStockCategoriesCache } from './stockCache'

/**
 * Suppression d'une catégorie (DELETE /stock-categories/{id}) : retirée localement, puis
 * rechargement des articles, que l'API a replacés dans « Non classés ».
 */
export function useDeleteStockCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => stockCategoriesService.deleteCategory(id),
    onSuccess: async (_response, id) => {
      updateStockCategoriesCache(queryClient, (categories) =>
        categories.filter((category) => category.id !== id),
      )
      await queryClient.invalidateQueries({ queryKey: stockKeys.items() })
    },
  })
}
