import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosService } from '@/services'
import { replaceTodoInCache } from './todosCache'

/**
 * Coche / décoche une tâche (POST /todos/{uuid}/toggle) et remplace la tâche par celle renvoyée.
 * Échec silencieux, comme le Vue (B-31, reproduit).
 */
export function useToggleTodoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => todosService.toggleTodo(uuid),
    onSuccess: (response) => {
      if (response?.todo) replaceTodoInCache(queryClient, response.todo)
    },
  })
}
