import type { DragEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import type { TodoDTO } from '@/models'
import { cn } from '@/lib/utils'
import { TodoCard } from './TodoCard'

type TodoColumnProps = {
  title: string
  /** Colonne « Sans catégorie » : bordure basse grise au lieu de la couleur de la catégorie. */
  uncategorized?: boolean
  /** Couleur de la catégorie (bordure basse de l'en-tête). */
  color?: string
  todos: TodoDTO[]
  /** Colonne survolée pendant un glisser-déposer. */
  isDropTarget: boolean
  draggingTodoUuid: string | undefined
  isToggleDisabled: (todo: TodoDTO) => boolean
  onDragOver: (event: DragEvent) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent) => void
  onToggle: (todo: TodoDTO) => void
  onEdit: (todo: TodoDTO) => void
  onDelete: (todo: TodoDTO) => void
  onDragStart: (event: DragEvent, todo: TodoDTO) => void
  onDragEnd: () => void
}

/** Colonne du tableau (cible de dépôt) : en-tête avec compteur, cartes, « Aucune tâche ». */
export function TodoColumn({
  title,
  uncategorized = false,
  color,
  todos,
  isDropTarget,
  draggingTodoUuid,
  isToggleDisabled,
  onDragOver,
  onDragLeave,
  onDrop,
  onToggle,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: TodoColumnProps) {
  return (
    <div
      className={cn(
        'flex w-full flex-1 flex-col rounded-xl border bg-card transition-all md:max-h-[calc(100svh-15rem)] md:min-w-[250px]',
        isDropTarget && 'border-primary ring-2 ring-primary/20',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className={cn(
          'flex shrink-0 items-center justify-between p-4',
          uncategorized && 'border-b-[3px] border-muted-foreground/30',
        )}
        style={uncategorized ? undefined : { borderBottom: `3px solid ${color}` }}
      >
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <Badge variant="secondary" className="text-xs">
          {todos.length}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
        {todos.map((todo) => (
          <TodoCard
            key={todo.uuid}
            todo={todo}
            isDragging={draggingTodoUuid !== undefined && draggingTodoUuid === todo.uuid}
            toggleDisabled={isToggleDisabled(todo)}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
        {todos.length === 0 && (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            Aucune tâche
          </div>
        )}
      </div>
    </div>
  )
}
