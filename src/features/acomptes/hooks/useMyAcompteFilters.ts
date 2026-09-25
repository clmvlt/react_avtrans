import { useState } from 'react'
import {
  EMPTY_MY_ACOMPTE_FILTERS,
  toMyAcompteParams,
  type MyAcompteFilters,
} from '../lib/acompteFilters'

/**
 * Filtres et pagination de « Mes acomptes » (même mécanique que `MyAcomptes.vue`) : `filters`
 * modifié en direct, sans brouillon (un champ changé puis le panneau fermé sans « Appliquer »
 * compte déjà dans le badge et le texte d'aide, comme le Vue), `params` figé à chaque chargement.
 */
export function useMyAcompteFilters() {
  const [filters, setFilters] = useState<MyAcompteFilters>(EMPTY_MY_ACOMPTE_FILTERS)
  const [params, setParams] = useState(() => toMyAcompteParams(EMPTY_MY_ACOMPTE_FILTERS, 0))

  const loadPage = (page: number, from: MyAcompteFilters = filters) =>
    setParams(toMyAcompteParams(from, page))

  const setField = (key: Exclude<keyof MyAcompteFilters, 'status'>, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }))

  const selectStatus = (status: string) => {
    if (filters.status === status) return
    const next = { ...filters, status }
    setFilters(next)
    loadPage(0, next)
  }

  const reset = () => {
    setFilters(EMPTY_MY_ACOMPTE_FILTERS)
    loadPage(0, EMPTY_MY_ACOMPTE_FILTERS)
  }

  // Filtres du panneau (hors statut) actifs : badge du bouton « Filtres »
  const activeFilterCount = [
    filters.montantMin,
    filters.montantMax,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length

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
