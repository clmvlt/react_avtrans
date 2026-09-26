import type { TodoDTO } from '@/models'

/** Couleur par défaut d'une nouvelle catégorie (violet de la marque). */
export const DEFAULT_CATEGORY_COLOR = '#581c87'

/** Cible de dépôt de la colonne « Sans catégorie ». */
export const NO_CATEGORY_TARGET = 'none'

/** Cible de dépôt de la corbeille flottante. */
export const TRASH_TARGET = 'trash'

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/** Masque les tâches terminées, sauf si « Afficher terminées » est coché. */
export const filterVisibleTodos = (todos: TodoDTO[], showCompleted: boolean) =>
  showCompleted ? todos : todos.filter((todo) => !todo.isDone)

/**
 * Tâches d'une colonne : `null` pour « Sans catégorie », sinon l'uuid de la catégorie.
 * Comme le Vue, une tâche dont la catégorie n'a pas de colonne (catégorie supprimée, ou
 * catégories non chargées) n'apparaît nulle part (B-17, reproduit).
 */
export const getTodosByCategory = (todos: TodoDTO[], categoryUuid: string | null | undefined) =>
  todos.filter((todo) => (todo.category?.uuid || null) === categoryUuid)
