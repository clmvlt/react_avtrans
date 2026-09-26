import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosService } from '@/services'
import { todoCategoriesKeys } from './queryKeys'

/**
 * Suppression d'une catégorie (DELETE /todo-categories/{uuid}), puis rechargement des seules
 * catégories, comme le Vue : les tâches ne sont pas rechargées et celles de la catégorie
 * supprimée disparaissent du tableau jusqu'au prochain chargement (B-17, reproduit).
 */
export function useDeleteTodoCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    // Clé commune : le dialog des catégories désactive ses boutons pendant l'une ou l'autre action
    mutationKey: todoCategoriesKeys.all,
    mutationFn: (uuid: string) => todosService.deleteCategory(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoCategoriesKeys.all }),
  })
}
