import { useState } from 'react'
import { Plus, Tags } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
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
      // Défilement horizontal quand les colonnes dépassent ; la marge interne laisse voir
      // l'anneau de la colonne survolée pendant un glisser-déposer
      <div className="-m-1 overflow-x-auto p-1">
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
      </div>
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader
        title="À faire"
        description="Les tâches de l'équipe, par colonne."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCategoriesOpen(true)}
            >
              <Tags className="size-4" />
              Gérer les catégories
            </Button>
            <Button type="button" size="sm" onClick={() => dialogs.open('form')}>
              <Plus className="size-4" />
              Nouvelle tâche
            </Button>
          </>
        }
      />

      <div className="space-y-4">
        <TodosToolbar showCompleted={showCompleted} onShowCompletedChange={setShowCompleted} />
        {content}
      </div>

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
    </PageContainer>
  )
}
