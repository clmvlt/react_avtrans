import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stockItemsService } from '@/services'
import { updateStockItemsCache } from './stockCache'

type AdjustStockQuantityVariables = {
  id: string
  /** Nouvelle quantité (déjà calculée, jamais négative). */
  quantite: number
  /** Quantité avant l'ajustement, restaurée en cas d'échec. */
  previousQuantite: number | undefined
}

/**
 * Stepper −/+ d'un article : PUT /stock-items/{id} avec `{ quantite }` seul.
 * Mise à jour optimiste de la quantité, annulée pour ce seul article si l'appel échoue
 * (le message d'erreur est affiché par l'appelant). Pas de rechargement ensuite, comme le Vue.
 *
 * Le rechargement éventuellement en cours (après un glisser-déposer) n'est pas annulé, pour ne
 * pas perdre la nouvelle catégorie : la quantité est réappliquée au succès.
 */
export function useAdjustStockQuantityMutation() {
  const queryClient = useQueryClient()

  const setQuantity = (id: string, quantite: number | undefined) =>
    updateStockItemsCache(queryClient, (items) =>
      items.map((item) => (item.id === id ? { ...item, quantite } : item)),
    )

  return useMutation({
    mutationFn: ({ id, quantite }: AdjustStockQuantityVariables) =>
      stockItemsService.updateStockItem(id, { quantite }),
    onMutate: ({ id, quantite }) => setQuantity(id, quantite),
    onSuccess: (_response, { id, quantite }) => setQuantity(id, quantite),
    onError: (_error, { id, previousQuantite }) => setQuantity(id, previousQuantite),
  })
}
