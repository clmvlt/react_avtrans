import type { SortingState } from '@tanstack/react-table'
import type { CouchetteDTO } from '@/models'

/** Colonnes triables de la table admin (identifiants des colonnes react-table). */
export type CouchetteSortKey = 'userName' | 'date' | 'createdAt'

const isSortKey = (id: string): id is CouchetteSortKey =>
  id === 'userName' || id === 'date' || id === 'createdAt'

function getSortValue(couchette: CouchetteDTO, key: CouchetteSortKey): unknown {
  if (key === 'userName') {
    return `${couchette.user?.firstName || ''} ${couchette.user?.lastName || ''}`.trim()
  }
  return couchette[key]
}

/**
 * Tri **client** de la page affichée, repris de `sortedData` de Couchettes.vue : `Date.parse`
 * d'abord, puis nombres, puis `localeCompare('fr')` ; valeurs absentes en fin de tri croissant,
 * en tête de tri décroissant. Aucun tri : ordre de l'API (date décroissante).
 *
 * Bug B-19 reproduit (MIGRATION.md 8.2) : seules les 20 lignes de la page sont triées alors que
 * le serveur pagine.
 */
export function sortCouchettes(couchettes: CouchetteDTO[], sorting: SortingState): CouchetteDTO[] {
  const sort = sorting[0]
  if (!sort || !isSortKey(sort.id)) return couchettes
  const key = sort.id
  const asc = !sort.desc

  return [...couchettes].sort((a, b) => {
    const aValue = getSortValue(a, key)
    const bValue = getSortValue(b, key)

    if (aValue == null && bValue == null) return 0
    if (aValue == null) return asc ? 1 : -1
    if (bValue == null) return asc ? -1 : 1

    const aDate = Date.parse(String(aValue))
    const bDate = Date.parse(String(bValue))
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return asc ? aDate - bDate : bDate - aDate
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return asc ? aValue - bValue : bValue - aValue
    }

    const comparison = String(aValue)
      .toLowerCase()
      .localeCompare(String(bValue).toLowerCase(), 'fr')
    return asc ? comparison : -comparison
  })
}
