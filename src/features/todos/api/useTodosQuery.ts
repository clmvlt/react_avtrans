import { useQuery } from '@tanstack/react-query'
import type { TodoSearchParams, TodoSearchResponse } from '@/models'
import { todosService } from '@/services'
import { todosKeys } from './queryKeys'

/**
 * Paramètres du Vue : toutes les tâches (terminées comprises) en une page de 1000 au plus,
 * les plus récentes d'abord. Pas de pagination au-delà (limite reprise telle quelle).
 */
const TODOS_SEARCH_PARAMS: TodoSearchParams = {
  size: 1000,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

const selectTodos = (response: TodoSearchResponse) => response.todos || []

/** Tâches du tableau (POST /todos/search). */
export function useTodosQuery() {
  return useQuery({
    queryKey: todosKeys.list(),
    queryFn: () => todosService.searchTodos(TODOS_SEARCH_PARAMS),
    select: selectTodos,
  })
}
