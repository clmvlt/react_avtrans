import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import type { FilterValues } from '@/components/shared/SearchFilters'
import type { TypeEntretienDTO } from '@/models'
import { useEntretiensHistoryQuery } from '../api/useEntretiensHistoryQuery'
import {
  applyHistoryFilterChange,
  buildHistorySearchParams,
  createDefaultHistoryFilters,
  filterEntretiensQuick,
  sortEntretiens,
} from '../lib/historySearch'

type UseEntretiensHistoryOptions = {
  /** EntretiensVehicule : historique d'un seul véhicule, sans filtre « Véhicule ». */
  vehiculeId?: string
  /** Types d'entretien (le filtre « Dossier » restreint le filtre « Type »). */
  types: TypeEntretienDTO[]
}

/**
 * État de l'historique des entretiens, partagé par /entretiens et /entretiens/vehicule/:id.
 *
 * Comme le Vue, les filtres se modifient librement et ne sont envoyés qu'à « Rechercher », au
 * changement de page (avec les filtres affichés à ce moment-là) ou à « Réinitialiser ».
 * La recherche rapide, le tri des en-têtes et le total des coûts ne portent que sur la page
 * affichée (bug B-20 reproduit).
 */
export function useEntretiensHistory({ vehiculeId, types }: UseEntretiensHistoryOptions) {
  const [filters, setFiltersState] = useState<FilterValues>(() =>
    createDefaultHistoryFilters(!vehiculeId),
  )
  const [applied, setApplied] = useState(() => ({ filters, page: 0 }))
  const [quickSearch, setQuickSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const params = buildHistorySearchParams(applied.filters, applied.page, vehiculeId)
  const query = useEntretiensHistoryQuery(params)

  const run = (nextFilters: FilterValues, page: number) => {
    const nextParams = buildHistorySearchParams(nextFilters, page, vehiculeId)
    // Mêmes paramètres : le Vue relançait quand même la requête.
    if (JSON.stringify(nextParams) === JSON.stringify(params)) void query.refetch()
    setApplied({ filters: nextFilters, page })
  }

  const filtered = filterEntretiensQuick(query.data?.content ?? [], quickSearch)
  const rows = sortEntretiens(filtered, sorting)

  return {
    query,
    /** Filtres affichés dans `SearchFilters`. */
    filters,
    setFilters: (next: FilterValues) =>
      setFiltersState((previous) => applyHistoryFilterChange(previous, next, types)),
    search: () => run(filters, 0),
    reset: () => {
      const defaults = createDefaultHistoryFilters(!vehiculeId)
      setQuickSearch('')
      setFiltersState(defaults)
      run(defaults, 0)
    },
    goToPage: (page: number) => run(filters, page),
    /** Page demandée (affichée immédiatement, comme le Vue). */
    page: applied.page,
    totalPages: query.data?.totalPages ?? 0,
    totalElements: query.data?.totalElements ?? 0,
    quickSearch,
    setQuickSearch,
    sorting,
    setSorting,
    /** Page affichée, filtrée par la recherche rapide puis triée par les en-têtes. */
    rows,
    /** Somme des coûts des lignes affichées. */
    totalCost: rows.reduce((sum, e) => sum + (e.cout || 0), 0),
  }
}

export type EntretiensHistoryState = ReturnType<typeof useEntretiensHistory>
