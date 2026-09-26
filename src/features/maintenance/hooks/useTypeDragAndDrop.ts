import { useState, type DragEvent } from 'react'
import type { DossierTypeEntretienDTO, TypeEntretienDTO } from '@/models'
import { useMoveTypeEntretienMutation } from '../api/useTypeEntretienMutations'
import { notifyError, notifySuccess } from '../lib/notify'
import { UNCLASSIFIED } from './useTypesExplorer'

/**
 * Glisser-déposer HTML5 natif des types vers un dossier ou « Non classés » (TypesEntretien.vue,
 * décision Q-DND : inopérant au tactile, comme le Vue). `setData` est ajouté pour que le glisser
 * démarre sous Firefox (MIGRATION.md 8.1).
 *
 * Déposer sur « Non classés » envoie `{}`, que l'API ignore : le type est affiché déplacé avec un
 * toast de succès mais reste dans son dossier côté serveur (MIGRATION.md 8.3, reproduit).
 */
export function useTypeDragAndDrop(dossiers: DossierTypeEntretienDTO[]) {
  const [draggedType, setDraggedType] = useState<TypeEntretienDTO | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)
  const moveType = useMoveTypeEntretienMutation()

  const endDrag = () => {
    setDraggedType(null)
    setDragOverFolderId(null)
  }

  const handleDrop = (event: DragEvent, folderId: string) => {
    event.preventDefault()
    const type = draggedType
    if (!type?.id) return

    const newDossierId = folderId === UNCLASSIFIED ? '' : folderId
    if ((type.dossier?.id || '') === newDossierId) {
      endDrag()
      return
    }

    const dossier = newDossierId ? dossiers.find((d) => d.id === newDossierId) : undefined
    const folderName =
      folderId === UNCLASSIFIED
        ? 'Non classés'
        : dossiers.find((d) => d.id === folderId)?.nom || 'le dossier'

    moveType.mutate(
      { type, dossier },
      {
        onSuccess: () => notifySuccess(`Type déplacé vers "${folderName}"`, 'Succès'),
        onError: () => notifyError('Erreur lors du déplacement', 'Erreur'),
        onSettled: endDrag,
      },
    )
  }

  return {
    dragOverFolderId,
    /** Props de la carte d'un type (source du glisser). */
    dragSourceProps: (type: TypeEntretienDTO) => ({
      onDragStart: (event: DragEvent) => {
        event.dataTransfer.setData('text/plain', type.id ?? '')
        event.dataTransfer.effectAllowed = 'move'
        setDraggedType(type)
      },
      onDragEnd: endDrag,
    }),
    /** Props d'un dossier ou de « Non classés » (zone de dépôt). */
    dropTargetProps: (folderId: string) => ({
      onDragOver: (event: DragEvent) => {
        event.preventDefault()
        if (draggedType) setDragOverFolderId(folderId)
      },
      onDragLeave: () => setDragOverFolderId(null),
      onDrop: (event: DragEvent) => handleDrop(event, folderId),
    }),
  }
}
