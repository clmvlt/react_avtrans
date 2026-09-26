import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stockItemsService } from '@/services'
import { stockKeys } from './queryKeys'

type MoveStockItemVariables = {
  id: string
  /** Catégorie cible ; `undefined` pour « Non classés » (champ omis du JSON). */
  categoryId: string | undefined
}

/**
 * Glisser-déposer d'un article sur une catégorie : PUT /stock-items/{id} avec `{ categoryId }`,
 * puis rechargement des articles (le Vue rechargeait la liste pour avoir la catégorie complète).
 * Vers « Non classés », le JSON est `{}` : l'API l'ignore et l'article reste classé, bien que le
 * succès soit annoncé (MIGRATION.md 8.3, reproduit).
 */
export function useMoveStockItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, categoryId }: MoveStockItemVariables) =>
      stockItemsService.updateStockItem(id, { categoryId }),
    // Promesse renvoyée : les callbacks de l'appelant (toast) passent après le rechargement.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: stockKeys.items() }),
  })
}
