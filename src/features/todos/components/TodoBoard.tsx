import type { DragEvent } from 'react'
import type { TodoCategoryDTO, TodoDTO } from '@/models'
import { useToggleTodoMutation } from '../api/useToggleTodoMutation'
import { getTodosByCategory, NO_CATEGORY_TARGET } from '../lib/todos'
import { TodoColumn } from './TodoColumn'

type TodoBoardProps = {
  /** Tâches visibles (terminées masquées selon le filtre). */
  todos: TodoDTO[]
  categories: TodoCategoryDTO[]
  draggingTodoUuid: string | undefined
  dragOverTarget: string | null
  onDragStart: (event: DragEvent, todo: TodoDTO) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent, target: string | undefined) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent, target: string | undefined) => void
  onEdit: (todo: TodoDTO) => void
  onDelete: (todo: TodoDTO) => void
}

/**
 * Tableau kanban : colonne « Sans catégorie », puis une colonne par catégorie (ordre de l'API).
 * Une seule bascule terminée / à faire à la fois, comme le Vue (les clics sont ignorés tant
 * qu'une bascule est en cours ; seul le bouton concerné est désactivé).
 */
export function TodoBoard({
  todos,
  categories,
  draggingTodoUuid,
  dragOverTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onEdit,
  onDelete,
}: TodoBoardProps) {
  const toggleMutation = useToggleTodoMutation()

  const handleToggle = (todo: TodoDTO) => {
    if (!todo.uuid || toggleMutation.isPending) return
    toggleMutation.mutate(todo.uuid)
  }

  const cardHandlers = {
    draggingTodoUuid,
    isToggleDisabled: (todo: TodoDTO) =>
      toggleMutation.isPending && toggleMutation.variables === todo.uuid,
    onToggle: handleToggle,
    onEdit,
    onDelete,
    onDragStart,
    onDragEnd,
    onDragLeave,
  }

  return (
    <div className="flex flex-col items-start gap-4 md:flex-row">
      <TodoColumn
        title="Sans catégorie"
        uncategorized
        todos={getTodosByCategory(todos, null)}
        isDropTarget={dragOverTarget === NO_CATEGORY_TARGET}
        onDragOver={(event) => onDragOver(event, NO_CATEGORY_TARGET)}
        onDrop={(event) => onDrop(event, NO_CATEGORY_TARGET)}
        {...cardHandlers}
      />
      {categories.map((category) => (
        <TodoColumn
          key={category.uuid}
          title={category.name ?? ''}
          color={category.color}
          todos={getTodosByCategory(todos, category.uuid)}
          isDropTarget={dragOverTarget === category.uuid}
          onDragOver={(event) => onDragOver(event, category.uuid)}
          onDrop={(event) => onDrop(event, category.uuid)}
          {...cardHandlers}
        />
      ))}
    </div>
  )
}
