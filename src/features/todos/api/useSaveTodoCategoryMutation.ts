import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTodoCategoryRequest } from '@/models'
import { todosService } from '@/services'
import { todoCategoriesKeys } from './queryKeys'

type SaveTodoCategoryVariables = {
  /** Catégorie modifiée ; absente en création. */
  uuid?: string
  data: CreateTodoCategoryRequest
}

/** Création (POST /todo-categories) ou modification (PUT) d'une catégorie, puis rechargement. */
export function useSaveTodoCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    // Clé commune : le dialog des catégories désactive ses boutons pendant l'une ou l'autre action
    mutationKey: todoCategoriesKeys.all,
    mutationFn: ({ uuid, data }: SaveTodoCategoryVariables) =>
      uuid ? todosService.updateCategory(uuid, data) : todosService.createCategory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: todoCategoriesKeys.all }),
  })
}
