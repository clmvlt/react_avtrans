import { useState } from 'react'
import { Plus, Tag } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
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

/**
 * Inventaire des pièces (`/stock`, admin ou mécanicien) : panneau des catégories à gauche
 * (empilé au-dessus sur téléphone), articles à droite.
 */
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

  // Création : catégorie affichée présélectionnée (sauf « Tous » et « Non classés »)
  const defaultCategoryId = selection && selection !== UNCLASSIFIED ? selection : ''

  const renderContent = () => {
    // Le Vue chargeait les catégories puis les articles avant d'afficher la page
    if (itemsQuery.isPending || categoriesQuery.isPending) return <StockSkeleton />

    if (!itemsQuery.data) {
      return (
        <ErrorState
          message={
            (itemsQuery.error instanceof Error && itemsQuery.error.message) ||
            'Erreur lors du chargement'
          }
          onRetry={() => void itemsQuery.refetch()}
          isRetrying={itemsQuery.isRefetching}
        />
      )
    }

    const items = itemsQuery.data
    const filteredItems = filterStockItems(items, selection, searchQuery)

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:items-start">
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
          onEditCategory={(category) => categoryDialogs.open('form', category)}
          onDeleteCategory={(category) => categoryDialogs.open('delete', category)}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <StockToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showDragHint={canManage && filteredItems.length > 0}
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
    )
  }

  return (
    <PageContainer size="full">
      <PageHeader
        title="Stock"
        description="Pièces et consommables, par catégorie."
        actions={
          canManage && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => categoryDialogs.open('form')}
              >
                <Tag className="size-4" />
                Nouvelle catégorie
              </Button>
              <Button type="button" size="sm" onClick={() => itemDialogs.open('form')}>
                <Plus className="size-4" />
                Ajouter un article
              </Button>
            </>
          )
        }
      />
      {renderContent()}

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
    </PageContainer>
  )
}
