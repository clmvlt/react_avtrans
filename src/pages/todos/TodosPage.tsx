import { useState } from 'react'
import { ErrorState } from '@/components/shared/ErrorState'
import { useTodoCategoriesQuery } from '@/features/todos/api/useTodoCategoriesQuery'
import { useTodosQuery } from '@/features/todos/api/useTodosQuery'
import { TodoBoard } from '@/features/todos/components/TodoBoard'
import { TodoBoardSkeleton } from '@/features/todos/components/TodoBoardSkeleton'
import { TodoCategoriesDialog } from '@/features/todos/components/TodoCategoriesDialog'
import { TodoDeleteDialog } from '@/features/todos/components/TodoDeleteDialog'
import { TodoFormDialog } from '@/features/todos/components/TodoFormDialog'
import { TodosToolbar } from '@/features/todos/components/TodosToolbar'
import { TodoTrashDropZone } from '@/features/todos/components/TodoTrashDropZone'
import { useTodoDragAndDrop } from '@/features/todos/hooks/useTodoDragAndDrop'
import { filterVisibleTodos } from '@/features/todos/lib/todos'
import { useDialogState } from '@/hooks/useDialogState'
import type { TodoDTO } from '@/models'

/** Tâches en kanban par catégorie (`/todos`, admin ou mécanicien). */
export default function TodosPage() {
  const todosQuery = useTodosQuery()
  // Un échec des catégories n'est pas affiché, comme le Vue (B-31) : les tâches classées
  // n'ont alors plus de colonne et disparaissent du tableau (B-17)
  const categoriesQuery = useTodoCategoriesQuery()
  const categories = categoriesQuery.data ?? []

  const [showCompleted, setShowCompleted] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const dialogs = useDialogState<'form' | 'delete', TodoDTO>()
  const dragAndDrop = useTodoDragAndDrop(categories)

  const formTodo = dialogs.type === 'form' ? dialogs.item : null

  let content
  if (todosQuery.isPending || categoriesQuery.isPending) {
    content = <TodoBoardSkeleton />
  } else if (!todosQuery.data) {
    content = (
      <ErrorState
        className="mb-4"
        message={
          (todosQuery.error instanceof Error && todosQuery.error.message) ||
          'Erreur lors du chargement des tâches'
        }
        onRetry={() => void todosQuery.refetch()}
        isRetrying={todosQuery.isRefetching}
      />
    )
  } else {
    content = (
      <TodoBoard
        todos={filterVisibleTodos(todosQuery.data, showCompleted)}
        categories={categories}
        draggingTodoUuid={dragAndDrop.draggingTodo?.uuid}
        dragOverTarget={dragAndDrop.dragOverTarget}
        onDragStart={dragAndDrop.handleDragStart}
        onDragEnd={dragAndDrop.handleDragEnd}
        onDragOver={dragAndDrop.handleDragOver}
        onDragLeave={dragAndDrop.handleDragLeave}
        onDrop={dragAndDrop.handleDrop}
        onEdit={(todo) => dialogs.open('form', todo)}
        onDelete={(todo) => dialogs.open('delete', todo)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TodosToolbar
        showCompleted={showCompleted}
        onShowCompletedChange={setShowCompleted}
        onOpenCategories={() => setCategoriesOpen(true)}
        onCreate={() => dialogs.open('form')}
      />

      <main className="overflow-x-auto px-6 py-6">{content}</main>

      <TodoTrashDropZone
        visible={!!dragAndDrop.draggingTodo}
        active={dragAndDrop.isOverTrash}
        onDragOver={dragAndDrop.handleTrashDragOver}
        onDragLeave={dragAndDrop.handleDragLeave}
        onDrop={dragAndDrop.handleDropToTrash}
      />

      <TodoCategoriesDialog open={categoriesOpen} onOpenChange={setCategoriesOpen} />
      <TodoFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        isCreating={!formTodo}
        todoUuid={formTodo?.uuid}
        categories={categories}
        onOpenCategories={() => {
          dialogs.close()
          setCategoriesOpen(true)
        }}
      />
      <TodoDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        todo={dialogs.type === 'delete' ? dialogs.item : null}
      />
    </div>
  )
}
