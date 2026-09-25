import type { Row } from '@tanstack/react-table'

/**
 * Comparateur générique des tables admin du Vue (Absences.vue:695-721, Acomptes.vue:652-678),
 * reproduit tel quel (bug B-19, non autorisé) :
 * - le tri ne porte que sur la page affichée (20 lignes), alors que l'API pagine ;
 * - toute valeur que `Date.parse` accepte est comparée comme une date (y compris un montant ou
 *   un texte qui ressemble à une date) ;
 * - sinon nombres, sinon texte (`localeCompare` fr, insensible à la casse) ;
 * - valeurs absentes en fin de liste en ordre croissant (en tête en décroissant).
 *
 * Renvoie l'ordre croissant : `DataTable` l'inverse pour l'ordre décroissant.
 */
export function legacyCompare(aValue: unknown, bValue: unknown): number {
  if (aValue == null && bValue == null) return 0
  if (aValue == null) return 1
  if (bValue == null) return -1

  const aDate = Date.parse(aValue as string)
  const bDate = Date.parse(bValue as string)
  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) return aDate - bDate

  if (typeof aValue === 'number' && typeof bValue === 'number') return aValue - bValue

  return String(aValue).toLowerCase().localeCompare(String(bValue).toLowerCase(), 'fr')
}

/** `sortingFn` de colonne TanStack fondé sur `legacyCompare`. */
export function legacySortingFn<TData>(rowA: Row<TData>, rowB: Row<TData>, columnId: string) {
  return legacyCompare(rowA.getValue(columnId), rowB.getValue(columnId))
}
