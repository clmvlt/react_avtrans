import { useQuery } from '@tanstack/react-query'
import { todosService } from '@/services'
import { todosKeys } from './queryKeys'

/**
 * Détail d'une tâche (GET /todos/{uuid} → `{ todo }`), rechargé à chaque ouverture du formulaire
 * d'édition comme le Vue (`gcTime: 0`).
 */
export function useTodoQuery(uuid: string | undefined, { enabled = true } = {}) {
  return useQuery({
    queryKey: todosKeys.detail(uuid ?? ''),
    queryFn: () => todosService.getTodoByUuid(uuid ?? ''),
    enabled: enabled && !!uuid,
    gcTime: 0,
  })
}
