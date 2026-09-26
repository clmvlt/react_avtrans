import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateTodoRequest } from '@/models'
import { todosService } from '@/services'
import { replaceTodoInCache, updateTodosCache } from './todosCache'

type SaveTodoVariables = {
  /** Tâche modifiée ; absente en création. */
  uuid?: string
  data: CreateTodoRequest
}

/**
 * Création (POST /todos) ou modification (PUT /todos/{uuid}) d'une tâche. Comme le Vue, la tâche
 * renvoyée est ajoutée en tête de liste ou remplace l'ancienne, sans recharger. Une description
 * ou une catégorie vidée est omise et l'API la laisse inchangée (MIGRATION.md 8.3, reproduit).
 */
export function useSaveTodoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: SaveTodoVariables) =>
      uuid ? todosService.updateTodo(uuid, data) : todosService.createTodo(data),
    onSuccess: (response, { uuid }) => {
      const saved = response?.todo
      if (!saved) return
      if (uuid) replaceTodoInCache(queryClient, saved)
      else updateTodosCache(queryClient, (todos) => [saved, ...todos])
    },
  })
}
