import type { SortingState } from '@tanstack/react-table'

type SortOptions = {
  /**
   * Essaie d'abord `Date.parse` sur chaque valeur, comme le tri générique de Heures.vue.
   * Bug B-19 reproduit (MIGRATION.md 8.2, non autorisé à la correction) : appliqué à des nombres
   * d'heures (« 8 », « 12.5 »…), `Date.parse` peut les lire comme des dates selon le navigateur,
   * d'où un tri numérique incohérent.
   */
  parseDates?: boolean
}

/**
 * Tri des tables Heures et Contrats, porté du Vue (`sortedData`) : un seul critère, valeurs
 * nulles toujours en fin de liste quel que soit le sens, nombres comparés numériquement, le reste
 * en texte minuscule (`localeCompare` français). Sans critère, l'ordre de l'API est conservé.
 * Le tri s'applique aux cartes mobiles comme au tableau.
 */
export function sortRowsLikeVue<T>(
  rows: T[],
  sorting: SortingState,
  getValue: (row: T, columnId: string) => unknown,
  { parseDates = false }: SortOptions = {},
): T[] {
  const sort = sorting[0]
  if (!sort) return rows
  const asc = !sort.desc

  return [...rows].sort((a, b) => {
    const aValue = getValue(a, sort.id)
    const bValue = getValue(b, sort.id)

    if (aValue == null && bValue == null) return 0
    if (aValue == null) return asc ? 1 : -1
    if (bValue == null) return asc ? -1 : 1

    if (parseDates) {
      const aDate = Date.parse(String(aValue))
      const bDate = Date.parse(String(bValue))
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return asc ? aDate - bDate : bDate - aDate
      }
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
