import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TodoDTO } from '@/models'
import { todosService } from '@/services'
import { todosKeys } from './queryKeys'
import { updateTodosCache } from './todosCache'

/**
 * Suppression par la corbeille (glisser-déposer) : DELETE /todos/{uuid}, optimiste et **sans
 * confirmation** ; en cas d'échec, la tâche revient à sa place sans aucun message (B-17, reproduit).
 */
export function useTrashTodoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => todosService.deleteTodo(uuid),
    onMutate: async (uuid) => {
      await queryClient.cancelQueries({ queryKey: todosKeys.list() })
      const todos = queryClient.getQueryData<{ todos?: TodoDTO[] }>(todosKeys.list())?.todos ?? []
      const index = todos.findIndex((todo) => todo.uuid === uuid)
      const removed = index !== -1 ? todos[index] : undefined
      updateTodosCache(queryClient, (current) => current.filter((todo) => todo.uuid !== uuid))
      return { index, removed }
    },
    onError: (_error, _uuid, context) => {
      const removed = context?.removed
      if (!removed) return
      updateTodosCache(queryClient, (current) => {
        const next = [...current]
        next.splice(context.index, 0, removed)
        return next
      })
    },
  })
}
