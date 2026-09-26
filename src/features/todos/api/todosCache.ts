import type { QueryClient } from '@tanstack/react-query'
import type { TodoDTO, TodoSearchResponse } from '@/models'
import { todosKeys } from './queryKeys'

/**
 * Modification locale de la liste des tâches en cache, équivalente aux modifications de tableau
 * du Vue (`unshift`, `splice`) : pas de nouveau GET là où le Vue n'en faisait pas.
 */
export function updateTodosCache(
  queryClient: QueryClient,
  updater: (todos: TodoDTO[]) => TodoDTO[],
) {
  queryClient.setQueryData<TodoSearchResponse>(todosKeys.list(), (old) =>
    old ? { ...old, todos: updater(old.todos || []) } : old,
  )
}

/** Remplace une tâche (par uuid) dans la liste en cache. */
export const replaceTodoInCache = (queryClient: QueryClient, todo: TodoDTO) =>
  updateTodosCache(queryClient, (todos) =>
    todos.map((current) => (current.uuid === todo.uuid ? todo : current)),
  )
