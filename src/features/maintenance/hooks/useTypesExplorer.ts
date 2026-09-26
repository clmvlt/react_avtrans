import { useState } from 'react'
import type { TypeEntretienDTO } from '@/models'

/** Dossier affiché : `null` = « Tous », `'unclassified'` = « Non classés », sinon l'id du dossier. */
export type FolderSelection = string | null

export const UNCLASSIFIED = 'unclassified'

/**
 * Navigation de TypesEntretien.vue : dossier sélectionné, recherche sur le nom et la description,
 * compteurs par dossier.
 */
export function useTypesExplorer(types: TypeEntretienDTO[]) {
  const [selectedFolderId, setSelectedFolderId] = useState<FolderSelection>(null)
  const [search, setSearch] = useState('')

  let filteredTypes = types
  if (selectedFolderId === UNCLASSIFIED) {
    filteredTypes = filteredTypes.filter((type) => !type.dossier)
  } else if (selectedFolderId) {
    filteredTypes = filteredTypes.filter((type) => type.dossier?.id === selectedFolderId)
  }
  if (search.trim()) {
    // Comme le Vue : le texte n'est pas « trimé » pour la comparaison
    const query = search.toLowerCase()
    filteredTypes = filteredTypes.filter(
      (type) =>
        type.nom?.toLowerCase().includes(query) || type.description?.toLowerCase().includes(query),
    )
  }

  return {
    selectedFolderId,
    selectFolder: setSelectedFolderId,
    search,
    setSearch,
    filteredTypes,
    unclassifiedCount: types.filter((type) => !type.dossier).length,
    countForFolder: (folderId: string) => types.filter((t) => t.dossier?.id === folderId).length,
  }
}
