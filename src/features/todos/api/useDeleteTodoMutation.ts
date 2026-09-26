import { useMutation, useQueryClient } from '@tanstack/react-query'
import { todosService } from '@/services'
import { updateTodosCache } from './todosCache'

/**
 * Suppression d'une tâche depuis le dialog de confirmation (DELETE /todos/{uuid}) : retirée de
 * la liste après succès. Échec silencieux, comme le Vue (B-31, reproduit).
 */
export function useDeleteTodoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => todosService.deleteTodo(uuid),
    onSuccess: (_response, uuid) => {
      updateTodosCache(queryClient, (todos) => todos.filter((todo) => todo.uuid !== uuid))
    },
  })
}
