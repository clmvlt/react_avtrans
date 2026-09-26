import { useState, type DragEvent } from 'react'
import { toast } from 'sonner'
import type { StockCategoryDTO, StockItemDTO } from '@/models'
import { useMoveStockItemMutation } from '../api/useMoveStockItemMutation'
import { UNCLASSIFIED } from '../lib/stock'

/**
 * Glisser-déposer HTML5 natif d'un article vers une catégorie de la barre latérale (Q-DND).
 * `target` : l'id d'une catégorie ou `UNCLASSIFIED`.
 * Inopérant au tactile, comme le Vue ; `dataTransfer.setData` ajouté pour Firefox (MIGRATION.md 8.1).
 */
export function useStockDragAndDrop(categories: StockCategoryDTO[]) {
  const [draggedItem, setDraggedItem] = useState<StockItemDTO | null>(null)
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null)
  const moveMutation = useMoveStockItemMutation()

  const handleDragStart = (event: DragEvent, item: StockItemDTO) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id ?? '')
    setDraggedItem(item)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverCategoryId(null)
  }

  const handleDragOver = (event: DragEvent, target: string) => {
    event.preventDefault()
    if (draggedItem) setDragOverCategoryId(target)
  }

  const handleDragLeave = () => setDragOverCategoryId(null)

  const handleDrop = (event: DragEvent, target: string) => {
    event.preventDefault()
    const item = draggedItem
    if (!item?.id) return

    const newCategoryId = target === UNCLASSIFIED ? undefined : target
    // Pas de requête si la catégorie ne change pas
    if (item.category?.id === newCategoryId) {
      handleDragEnd()
      return
    }

    const categoryLabel =
      target === UNCLASSIFIED
        ? 'Non classés'
        : categories.find((category) => category.id === target)?.nom || 'la catégorie'

    moveMutation.mutate(
      { id: item.id, categoryId: newCategoryId },
      {
        onSuccess: () =>
          toast.success('Succès', { description: `Article déplacé vers "${categoryLabel}"` }),
        onError: () => toast.error('Erreur', { description: 'Erreur lors du déplacement' }),
      },
    )
    handleDragEnd()
  }

  return {
    draggedItem,
    dragOverCategoryId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  }
}
