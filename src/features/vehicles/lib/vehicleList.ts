import type { SortingState } from '@tanstack/react-table'
import type { VehiculeDTO } from '@/models'

/**
 * Recherche de la liste (Vehicules.vue:697) : insensible à la casse, sur l'immatriculation,
 * l'immatriculation relais, la marque et le modèle.
 */
export function filterVehicles(vehicles: VehiculeDTO[], search: string): VehiculeDTO[] {
  if (!search.trim()) return vehicles
  const query = search.toLowerCase().trim()
  return vehicles.filter(
    (vehicule) =>
      (vehicule.immat?.toLowerCase().includes(query) ?? false) ||
      (vehicule.relaiImmat?.toLowerCase().includes(query) ?? false) ||
      (vehicule.brand?.toLowerCase().includes(query) ?? false) ||
      (vehicule.model?.toLowerCase().includes(query) ?? false),
  )
}

/** Colonnes triables de la liste et valeur comparée (`undefined` = vide, trié en dernier). */
export const VEHICLE_SORT_VALUES = {
  immat: (vehicule: VehiculeDTO) => vehicule.immat ?? undefined,
  latestKm: (vehicule: VehiculeDTO) => vehicule.latestKm ?? undefined,
  latestKmDate: (vehicule: VehiculeDTO) => vehicule.latestKmDate ?? undefined,
} satisfies Record<string, (vehicule: VehiculeDTO) => unknown>

export type VehicleSortColumn = keyof typeof VEHICLE_SORT_VALUES

/**
 * Comparateur des tables du Vue (Vehicules.vue:741-763), en ordre croissant. Bug B-19 reproduit :
 * `Date.parse` est tenté d'abord sur toutes les valeurs, y compris les kilométrages (« 12 » est lu
 * comme décembre 2001, « 99 » comme 1999…) et les immatriculations ; puis comparaison numérique,
 * puis `localeCompare('fr')` sans casse.
 */
export function compareLikeVue(a: unknown, b: unknown): number {
  const aDate = Date.parse(String(a))
  const bDate = Date.parse(String(b))
  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) return aDate - bDate
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).toLowerCase().localeCompare(String(b).toLowerCase(), 'fr')
}

const isSortColumn = (id: string): id is VehicleSortColumn => id in VEHICLE_SORT_VALUES

/**
 * Applique le tri de la table desktop à la liste mobile (le Vue triait les deux vues avec le même
 * état). Valeurs vides en fin en croissant, en tête en décroissant ; tri stable.
 */
export function sortVehicles(vehicles: VehiculeDTO[], sorting: SortingState): VehiculeDTO[] {
  const [sort] = sorting
  if (!sort || !isSortColumn(sort.id)) return vehicles
  const getValue = VEHICLE_SORT_VALUES[sort.id]
  const direction = sort.desc ? -1 : 1

  return [...vehicles].sort((left, right) => {
    const a = getValue(left)
    const b = getValue(right)
    if (a == null && b == null) return 0
    if (a == null) return direction
    if (b == null) return -direction
    return direction * compareLikeVue(a, b)
  })
}
