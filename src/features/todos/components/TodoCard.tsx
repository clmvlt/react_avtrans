import type { DragEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TodoDTO } from '@/models'
import { cn } from '@/lib/utils'
import { truncateText } from '../lib/todos'
import { TodoToggleButton } from './TodoToggleButton'

type TodoCardProps = {
  todo: TodoDTO
  /** Carte en cours de glisser-déposer (atténuée). */
  isDragging: boolean
  toggleDisabled: boolean
  onToggle: (todo: TodoDTO) => void
  onEdit: (todo: TodoDTO) => void
  onDelete: (todo: TodoDTO) => void
  onDragStart: (event: DragEvent, todo: TodoDTO) => void
  onDragEnd: () => void
}

/**
 * Carte d'une tâche : bouton rond, titre (barré si terminée), description tronquée, prénom du
 * créateur ; crayon et corbeille au survol en desktop (et au focus clavier), toujours en mobile.
 */
export function TodoCard({
  todo,
  isDragging,
  toggleDisabled,
  onToggle,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
}: TodoCardProps) {
  return (
    <div
      className={cn(
        'group cursor-grab rounded-lg border bg-muted/50 p-3 transition-all hover:border-border/80 hover:shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-50',
        todo.isDone && 'opacity-60',
      )}
      draggable
      onDragStart={(event) => onDragStart(event, todo)}
      onDragEnd={onDragEnd}
    >
      <div className="mb-2 flex items-start gap-2">
        <TodoToggleButton
          done={!!todo.isDone}
          disabled={toggleDisabled}
          onToggle={() => onToggle(todo)}
        />
        <span
          className={cn(
            'text-sm leading-snug font-medium break-words',
            todo.isDone ? 'text-muted-foreground line-through' : 'text-foreground',
          )}
        >
          {todo.title}
        </span>
      </div>
      {todo.description && (
        <p className="mb-2 text-xs leading-snug break-words text-muted-foreground">
          {truncateText(todo.description, 80)}
        </p>
      )}
      <div className="flex items-center justify-between border-t pt-2">
        {todo.createdBy ? (
          <span className="text-xs text-muted-foreground">{todo.createdBy.firstName}</span>
        ) : (
          <span />
        )}
        <div className="flex gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100 md:opacity-0">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Modifier"
            aria-label="Modifier"
            onClick={(event) => {
              event.stopPropagation()
              onEdit(todo)
            }}
          >
            <Pencil className="size-3.5 text-primary" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            title="Supprimer"
            aria-label="Supprimer"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(todo)
            }}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  )
}
