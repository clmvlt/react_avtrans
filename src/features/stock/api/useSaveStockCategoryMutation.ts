import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stockCategoriesService, type StockCategoryCreateRequest } from '@/services'
import { stockKeys } from './queryKeys'
import { updateStockCategoriesCache } from './stockCache'

type SaveStockCategoryVariables = {
  /** Identifiant de la catégorie en modification ; absent en création. */
  id?: string
  data: StockCategoryCreateRequest
}

/**
 * Création (POST) ou modification (PUT /stock-categories/{id}) d'une catégorie de stock.
 * Comme le Vue : ajout ou remplacement local ; en modification, rechargement des articles
 * (ils embarquent le nom de leur catégorie) avant le message de succès.
 */
export function useSaveStockCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: SaveStockCategoryVariables) =>
      id
        ? stockCategoriesService.updateCategory(id, data)
        : stockCategoriesService.createCategory(data),
    onSuccess: async (response, { id }) => {
      const saved = response.category
      if (saved) {
        updateStockCategoriesCache(queryClient, (categories) =>
          id
            ? categories.map((category) => (category.id === id ? saved : category))
            : [...categories, saved],
        )
      }
      if (id) await queryClient.invalidateQueries({ queryKey: stockKeys.items() })
    },
  })
}
