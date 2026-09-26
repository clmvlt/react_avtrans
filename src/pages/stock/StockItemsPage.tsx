import { useState } from 'react'
import { ErrorState } from '@/components/shared/ErrorState'
import { useStockCategoriesQuery } from '@/features/stock/api/useStockCategoriesQuery'
import { useStockItemsQuery } from '@/features/stock/api/useStockItemsQuery'
import { StockCategoryDeleteDialog } from '@/features/stock/components/StockCategoryDeleteDialog'
import { StockCategoryFormDialog } from '@/features/stock/components/StockCategoryFormDialog'
import { StockCategorySidebar } from '@/features/stock/components/StockCategorySidebar'
import { StockItemDeleteDialog } from '@/features/stock/components/StockItemDeleteDialog'
import { StockItemFormDialog } from '@/features/stock/components/StockItemFormDialog'
import { StockItemList } from '@/features/stock/components/StockItemList'
import { StockSkeleton } from '@/features/stock/components/StockSkeleton'
import { StockToolbar } from '@/features/stock/components/StockToolbar'
import { useCanManageStock } from '@/features/stock/hooks/useCanManageStock'
import { useStockDragAndDrop } from '@/features/stock/hooks/useStockDragAndDrop'
import {
  filterStockItems,
  UNCLASSIFIED,
  type StockCategorySelection,
} from '@/features/stock/lib/stock'
import { useDialogState } from '@/hooks/useDialogState'
import type { StockCategoryDTO, StockItemDTO } from '@/models'

/** Inventaire des pièces (`/stock`, admin ou mécanicien), avec barre latérale de catégories. */
export default function StockItemsPage() {
  const canManage = useCanManageStock()
  const itemsQuery = useStockItemsQuery()
  const categoriesQuery = useStockCategoriesQuery()
  const categories = categoriesQuery.data ?? []

  const [selection, setSelection] = useState<StockCategorySelection>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const itemDialogs = useDialogState<'form' | 'delete', StockItemDTO>()
  const categoryDialogs = useDialogState<'form' | 'delete', StockCategoryDTO>()
  const dragAndDrop = useStockDragAndDrop(categories)

  // Le Vue chargeait les catégories puis les articles avant d'afficher la page
  if (itemsQuery.isPending || categoriesQuery.isPending) {
    return <StockSkeleton />
  }

  if (!itemsQuery.data) {
    return (
      <div className="m-4">
        <ErrorState
          message={
            (itemsQuery.error instanceof Error && itemsQuery.error.message) ||
            'Erreur lors du chargement'
          }
          onRetry={() => void itemsQuery.refetch()}
          isRetrying={itemsQuery.isRefetching}
        />
      </div>
    )
  }

  const items = itemsQuery.data
  const filteredItems = filterStockItems(items, selection, searchQuery)
  // Création : catégorie affichée présélectionnée (sauf « Tous » et « Non classés »)
  const defaultCategoryId = selection && selection !== UNCLASSIFIED ? selection : ''

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 md:grid-cols-[280px_1fr]">
          <StockCategorySidebar
            items={items}
            categories={categories}
            selection={selection}
            onSelect={setSelection}
            canManage={canManage}
            dragOverCategoryId={dragAndDrop.dragOverCategoryId}
            onDragOver={dragAndDrop.handleDragOver}
            onDragLeave={dragAndDrop.handleDragLeave}
            onDrop={dragAndDrop.handleDrop}
            onCreateCategory={() => categoryDialogs.open('form')}
            onEditCategory={(category) => categoryDialogs.open('form', category)}
            onDeleteCategory={(category) => categoryDialogs.open('delete', category)}
          />

          <div className="flex flex-col gap-4 p-4 md:p-6">
            <StockToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              canManage={canManage}
              showDragHint={filteredItems.length > 0}
              onCreateItem={() => itemDialogs.open('form')}
            />
            <StockItemList
              items={filteredItems}
              selection={selection}
              searchQuery={searchQuery}
              canManage={canManage}
              onDragStart={dragAndDrop.handleDragStart}
              onDragEnd={dragAndDrop.handleDragEnd}
              onEdit={(item) => itemDialogs.open('form', item)}
              onDelete={(item) => itemDialogs.open('delete', item)}
            />
          </div>
        </div>
      </main>

      <StockItemFormDialog
        open={itemDialogs.isOpen('form')}
        onOpenChange={itemDialogs.onOpenChange}
        item={itemDialogs.type === 'form' ? itemDialogs.item : null}
        defaultCategoryId={defaultCategoryId}
        categories={categories}
      />
      <StockCategoryFormDialog
        open={categoryDialogs.isOpen('form')}
        onOpenChange={categoryDialogs.onOpenChange}
        category={categoryDialogs.type === 'form' ? categoryDialogs.item : null}
      />
      <StockItemDeleteDialog
        open={itemDialogs.isOpen('delete')}
        onOpenChange={itemDialogs.onOpenChange}
        item={itemDialogs.type === 'delete' ? itemDialogs.item : null}
      />
      <StockCategoryDeleteDialog
        open={categoryDialogs.isOpen('delete')}
        onOpenChange={categoryDialogs.onOpenChange}
        category={categoryDialogs.type === 'delete' ? categoryDialogs.item : null}
        onDeleted={(categoryId) => {
          if (selection === categoryId) setSelection(null)
        }}
      />
    </div>
  )
}
