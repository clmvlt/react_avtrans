import { LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TodoCategoryDTO } from '@/models'
import { useTodoQuery } from '../api/useTodoQuery'
import { TodoForm } from './TodoForm'

type TodoFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isCreating: boolean
  /** Tâche à modifier (rechargée par GET /todos/{uuid} à chaque ouverture, comme le Vue). */
  todoUuid?: string
  categories: TodoCategoryDTO[]
  onOpenCategories: () => void
}

/** Dialog « Nouvelle tâche » / « Modifier la tâche ». */
export function TodoFormDialog({
  open,
  onOpenChange,
  isCreating,
  todoUuid,
  categories,
  onOpenCategories,
}: TodoFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Nouvelle tâche' : 'Modifier la tâche'}</DialogTitle>
          <DialogDescription className="sr-only">
            {isCreating ? 'Créer une nouvelle tâche' : 'Modifier la tâche existante'}
          </DialogDescription>
        </DialogHeader>
        <TodoFormDialogBody
          key={isCreating ? 'new' : todoUuid}
          isCreating={isCreating}
          todoUuid={todoUuid}
          categories={categories}
          onClose={() => onOpenChange(false)}
          onOpenCategories={onOpenCategories}
        />
      </DialogContent>
    </Dialog>
  )
}

type TodoFormDialogBodyProps = {
  isCreating: boolean
  todoUuid?: string
  categories: TodoCategoryDTO[]
  onClose: () => void
  onOpenCategories: () => void
}

function TodoFormDialogBody({
  isCreating,
  todoUuid,
  categories,
  onClose,
  onOpenCategories,
}: TodoFormDialogBodyProps) {
  const todoQuery = useTodoQuery(todoUuid, { enabled: !isCreating })

  if (!isCreating && todoUuid && todoQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const loadError =
    !isCreating && todoQuery.isError
      ? (todoQuery.error instanceof Error && todoQuery.error.message) || 'Erreur lors du chargement'
      : ''

  return (
    <TodoForm
      isCreating={isCreating}
      todoUuid={todoUuid}
      todo={isCreating ? null : (todoQuery.data?.todo ?? null)}
      loadError={loadError}
      categories={categories}
      onCancel={onClose}
      onSaved={onClose}
      onOpenCategories={onOpenCategories}
    />
  )
}
