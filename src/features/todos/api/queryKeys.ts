/** Clés TanStack Query des tâches. */
export const todosKeys = {
  all: ['todos'] as const,
  list: () => [...todosKeys.all, 'list'] as const,
  detail: (uuid: string) => [...todosKeys.all, 'detail', uuid] as const,
}

/** Clés TanStack Query des catégories de tâches. */
export const todoCategoriesKeys = {
  all: ['todo-categories'] as const,
}
