import { useQuery } from '@tanstack/react-query'
import type { TodoCategoriesResponse } from '@/models'
import { todosService } from '@/services'
import { todoCategoriesKeys } from './queryKeys'

const selectCategories = (response: TodoCategoriesResponse) => response.categories || []

/**
 * Catégories de tâches (GET /todo-categories → `{ success, categories }`), partagées par le
 * tableau et le dialog de gestion des catégories.
 */
export function useTodoCategoriesQuery() {
  return useQuery({
    queryKey: todoCategoriesKeys.all,
    queryFn: () => todosService.getCategories(),
    select: selectCategories,
  })
}
