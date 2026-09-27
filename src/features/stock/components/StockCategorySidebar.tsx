import type { DragEvent } from 'react'
import { Inbox, List, Tag } from 'lucide-react'
import type { StockCategoryDTO, StockItemDTO } from '@/models'
import { countItemsInCategory, UNCLASSIFIED, type StockCategorySelection } from '../lib/stock'
import { StockCategoryActions } from './StockCategoryActions'
import { StockCategoryNavItem } from './StockCategoryNavItem'

type StockCategorySidebarProps = {
  items: StockItemDTO[]
  categories: StockCategoryDTO[]
  selection: StockCategorySelection
  onSelect: (selection: StockCategorySelection) => void
  /** Modification et suppression des catégories (la création est dans l'en-tête de la page). */
  canManage: boolean
  /** Cible survolée pendant un glisser-déposer (id de catégorie ou `UNCLASSIFIED`). */
  dragOverCategoryId: string | null
  onDragOver: (event: DragEvent, target: string) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent, target: string) => void
  onEditCategory: (category: StockCategoryDTO) => void
  onDeleteCategory: (category: StockCategoryDTO) => void
}

/**
 * Panneau des catégories : « Tous », une entrée par catégorie (cible de dépôt, actions),
 * « Non classés ». Carte collante à gauche en desktop (liste qui défile si besoin), rangée qui
 * défile horizontalement en mobile.
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
  onEditCategory,
  onDeleteCategory,
}: StockCategorySidebarProps) {
  const unclassifiedCount = items.filter((item) => !item.category).length

  return (
    <aside className="rounded-xl border bg-card md:sticky md:top-20 md:flex md:max-h-[calc(100dvh-6.5rem)] md:flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Catégories</h2>
      </div>

      {/* Téléphone : rangée qui défile horizontalement ; ordinateur : liste verticale */}
      <div className="flex min-h-0 gap-2 overflow-x-auto p-2 md:flex-col md:gap-0 md:overflow-x-visible md:overflow-y-auto">
        <StockCategoryNavItem
          icon={List}
          iconClassName="text-primary"
          label="Tous"
          count={items.length}
          selected={selection === null}
          onSelect={() => onSelect(null)}
          className="md:mb-2"
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
          className="md:mt-2 md:rounded-none md:border-t md:pt-3"
        />
      </div>
    </aside>
  )
}
