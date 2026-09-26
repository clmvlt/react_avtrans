import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TodoCategoryDTO, TodoDTO } from '@/models'
import { todosService } from '@/services'
import { todosKeys } from './queryKeys'
import { replaceTodoInCache, updateTodosCache } from './todosCache'

type MoveTodoVariables = {
  todo: TodoDTO & { uuid: string }
  /** Catégorie cible ; `undefined` pour « Sans catégorie ». */
  targetCategory: TodoCategoryDTO | undefined
  targetCategoryUuid: string | undefined
}

/**
 * Glisser-déposer d'une tâche dans une colonne : PUT /todos/{uuid} avec titre, description et
 * catégorie. Mise à jour optimiste, annulée en silence si l'appel échoue (B-31, reproduit).
 * Vers « Sans catégorie », `categoryUuid` est omis et l'API l'ignore : la tâche paraît déplacée
 * mais reste classée côté serveur (MIGRATION.md 8.3, reproduit : pas de rechargement).
 */
export function useMoveTodoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ todo, targetCategoryUuid }: MoveTodoVariables) =>
      todosService.updateTodo(todo.uuid, {
        title: todo.title,
        description: todo.description,
        categoryUuid: targetCategoryUuid,
      }),
    onMutate: async ({ todo, targetCategory }) => {
      await queryClient.cancelQueries({ queryKey: todosKeys.list() })
      const original = queryClient
        .getQueryData<{ todos?: TodoDTO[] }>(todosKeys.list())
        ?.todos?.find((current) => current.uuid === todo.uuid)
      updateTodosCache(queryClient, (todos) =>
        todos.map((current) =>
          current.uuid === todo.uuid
            ? { ...current, category: targetCategory ? { ...targetCategory } : undefined }
            : current,
        ),
      )
      return { original }
    },
    onError: (_error, _variables, context) => {
      if (context?.original) replaceTodoInCache(queryClient, context.original)
    },
  })
}
