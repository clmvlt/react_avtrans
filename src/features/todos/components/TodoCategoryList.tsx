import { LoaderCircle, Pencil, Tags, Trash2 } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import type { TodoCategoryDTO } from '@/models'
import { cn } from '@/lib/utils'
import { useTodoCategoriesQuery } from '../api/useTodoCategoriesQuery'

type TodoCategoryListProps = {
  editingUuid: string | undefined
  busy: boolean
  onEdit: (category: TodoCategoryDTO) => void
  onDelete: (category: TodoCategoryDTO) => void
}

/** Liste des catégories du dialog de gestion : pastille de couleur, nom, crayon, corbeille. */
export function TodoCategoryList({ editingUuid, busy, onEdit, onDelete }: TodoCategoryListProps) {
  const categoriesQuery = useTodoCategoriesQuery()

  if (categoriesQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <LoaderCircle className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!categoriesQuery.data) {
    return (
      <ErrorState
        message={
          (categoriesQuery.error instanceof Error && categoriesQuery.error.message) ||
          'Erreur lors du chargement'
        }
        onRetry={() => void categoriesQuery.refetch()}
        isRetrying={categoriesQuery.isRefetching}
      />
    )
  }

  const categories = categoriesQuery.data

  if (categories.length === 0) {
    return (
      <Empty className="gap-3 rounded-none p-0 py-8 text-muted-foreground md:p-0 md:py-8">
        <Tags className="size-8 opacity-50" />
        <p className="font-medium">Aucune catégorie</p>
        <span className="text-sm">Créez votre première catégorie ci-dessus</span>
      </Empty>
    )
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.uuid}
          className={cn(
            'flex items-center justify-between rounded-lg border p-3 transition-colors hover:border-border/80 hover:shadow-sm',
            editingUuid !== undefined && editingUuid === category.uuid
              ? 'border-primary bg-primary/5'
              : 'bg-card',
          )}
        >
          <div className="flex items-center gap-3">
            <span className="size-5 shrink-0 rounded" style={{ backgroundColor: category.color }} />
            <span className="font-medium text-foreground">{category.name}</span>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              title="Modifier"
              aria-label={`Modifier la catégorie ${category.name ?? ''}`}
              onClick={() => onEdit(category)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={busy}
              title="Supprimer"
              aria-label={`Supprimer la catégorie ${category.name ?? ''}`}
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(category)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
