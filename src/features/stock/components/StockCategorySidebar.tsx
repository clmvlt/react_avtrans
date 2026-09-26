import type { DragEvent } from 'react'
import { Inbox, List, Plus, Tag } from 'lucide-react'
import { BackButton } from '@/components/shared/BackButton'
import { Button } from '@/components/ui/button'
import type { StockCategoryDTO, StockItemDTO } from '@/models'
import { countItemsInCategory, UNCLASSIFIED, type StockCategorySelection } from '../lib/stock'
import { StockCategoryActions } from './StockCategoryActions'
import { StockCategoryNavItem } from './StockCategoryNavItem'

type StockCategorySidebarProps = {
  items: StockItemDTO[]
  categories: StockCategoryDTO[]
  selection: StockCategorySelection
  onSelect: (selection: StockCategorySelection) => void
  canManage: boolean
  /** Cible survolée pendant un glisser-déposer (id de catégorie ou `UNCLASSIFIED`). */
  dragOverCategoryId: string | null
  onDragOver: (event: DragEvent, target: string) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent, target: string) => void
  onCreateCategory: () => void
  onEditCategory: (category: StockCategoryDTO) => void
  onDeleteCategory: (category: StockCategoryDTO) => void
}

/**
 * Barre latérale des catégories : « Tous », une entrée par catégorie (cible de dépôt, actions),
 * « Non classés ». Colonne sticky en desktop, puces qui passent à la ligne en mobile.
 */
export function StockCategorySidebar({
  items,
  categories,
  selection,
  onSelect,
  canManage,
  dragOverCategoryId,
  onDragOver,
  onDragLeave,
  onDrop,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
}: StockCategorySidebarProps) {
  const unclassifiedCount = items.filter((item) => !item.category).length

  return (
    <aside className="border-b bg-background md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-b-0">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <BackButton fallback="/entretiens" size="icon" className="size-7" title="Retour" />
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Catégories
          </h2>
        </div>
        {canManage && (
          <Button
            type="button"
            variant="default"
            size="icon-sm"
            title="Créer une catégorie"
            aria-label="Créer une catégorie"
            onClick={onCreateCategory}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 overflow-y-auto p-2 md:flex-col md:flex-nowrap md:gap-0">
        <StockCategoryNavItem
          icon={List}
          iconClassName="text-primary"
          label="Tous"
          count={items.length}
          selected={selection === null}
          onSelect={() => onSelect(null)}
          className="mb-2"
        />

        {categories.map((category) => {
          const categoryId = category.id ?? ''
          const selected = selection === categoryId
          return (
            <StockCategoryNavItem
              key={categoryId}
              icon={Tag}
              iconClassName="text-amber-500"
              label={category.nom ?? ''}
              count={countItemsInCategory(items, categoryId)}
              selected={selected}
              dropActive={dragOverCategoryId === categoryId}
              hideCountOnHover
              onSelect={() => onSelect(categoryId)}
              onDragOver={(event) => onDragOver(event, categoryId)}
              onDragLeave={onDragLeave}
              onDrop={(event) => onDrop(event, categoryId)}
              className="md:mb-1"
              actions={
                canManage && (
                  <StockCategoryActions
                    selected={selected}
                    onEdit={() => onEditCategory(category)}
                    onDelete={() => onDeleteCategory(category)}
                  />
                )
              }
            />
          )
        })}

        <StockCategoryNavItem
          icon={Inbox}
          iconClassName="text-muted-foreground"
          label="Non classés"
          count={unclassifiedCount}
          selected={selection === UNCLASSIFIED}
          dropActive={dragOverCategoryId === UNCLASSIFIED}
          onSelect={() => onSelect(UNCLASSIFIED)}
          onDragOver={(event) => onDragOver(event, UNCLASSIFIED)}
          onDragLeave={onDragLeave}
          onDrop={(event) => onDrop(event, UNCLASSIFIED)}
          className="mt-0 border-t pt-3 md:mt-2"
        />
      </div>
    </aside>
  )
}
