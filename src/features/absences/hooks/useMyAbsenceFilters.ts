import { useState } from 'react'
import {
  EMPTY_MY_ABSENCE_FILTERS,
  toMyAbsenceParams,
  type MyAbsenceFilters,
} from '../lib/absenceFilters'

/**
 * Filtres et pagination de « Mes absences » (même mécanique que `MyAbsences.vue`) :
 * - `filters` : statut (puces) et champs du panneau, modifiés en direct, sans brouillon : un
 *   champ changé puis le panneau fermé sans « Appliquer » compte déjà dans le badge et le texte
 *   d'aide (comportement du Vue conservé) ;
 * - `params` : corps de la recherche, figé à chaque chargement à partir de `filters`.
 */
export function useMyAbsenceFilters() {
  const [filters, setFilters] = useState<MyAbsenceFilters>(EMPTY_MY_ABSENCE_FILTERS)
  const [params, setParams] = useState(() => toMyAbsenceParams(EMPTY_MY_ABSENCE_FILTERS, 0))

  const loadPage = (page: number, from: MyAbsenceFilters = filters) =>
    setParams(toMyAbsenceParams(from, page))

  const setField = (key: Exclude<keyof MyAbsenceFilters, 'status'>, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }))

  const selectStatus = (status: string) => {
    if (filters.status === status) return
    const next = { ...filters, status }
    setFilters(next)
    loadPage(0, next)
  }

  const reset = () => {
    setFilters(EMPTY_MY_ABSENCE_FILTERS)
    loadPage(0, EMPTY_MY_ABSENCE_FILTERS)
  }

  // Filtres du panneau (hors statut) actifs : badge du bouton « Filtres »
  const activeFilterCount = [filters.absenceTypeUuid, filters.startDate, filters.endDate].filter(
    Boolean,
  ).length

  return {
    filters,
    params,
    setField,
    selectStatus,
    loadPage,
    apply: () => loadPage(0),
    reset,
    activeFilterCount,
    hasAnyFilter: activeFilterCount > 0 || !!filters.status,
  }
}
