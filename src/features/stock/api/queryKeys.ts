/** Clés TanStack Query du stock (articles et catégories). */
export const stockKeys = {
  all: ['stock'] as const,
  items: () => [...stockKeys.all, 'items'] as const,
  categories: () => [...stockKeys.all, 'categories'] as const,
}
