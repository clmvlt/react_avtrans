import type { DragEvent } from 'react'
import type { StockItemDTO } from '@/models'
import type { StockCategorySelection } from '../lib/stock'
import { StockEmptyState } from './StockEmptyState'
import { StockItemCard } from './StockItemCard'

type StockItemListProps = {
  items: StockItemDTO[]
  selection: StockCategorySelection
  searchQuery: string
  canManage: boolean
  onDragStart: (event: DragEvent, item: StockItemDTO) => void
  onDragEnd: () => void
  onEdit: (item: StockItemDTO) => void
  onDelete: (item: StockItemDTO) => void
}

/** Articles filtrés (sans tri ni pagination, comme le Vue), ou état vide. */
export function StockItemList({
  items,
  selection,
  searchQuery,
  canManage,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
}: StockItemListProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <StockItemCard
          key={item.id}
          item={item}
          canManage={canManage}
          showCategory={selection === null}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {items.length === 0 && <StockEmptyState searchQuery={searchQuery} selection={selection} />}
    </div>
  )
}
