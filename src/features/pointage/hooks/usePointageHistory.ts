import { useState } from 'react'
import { useServiceHistoryQuery } from '../api/useServiceHistoryQuery'
import {
  EMPTY_HISTORY_FILTERS,
  countActiveFilters,
  toIsBreak,
  type HistoryFilters,
} from '../schemas/historyFilters'

const HISTORY_PAGE_SIZE = 20

const sameFilters = (a: HistoryFilters, b: HistoryFilters) =>
  a.startDate === b.startDate && a.endDate === b.endDate && a.type === b.type

/**
 * Historique des pointages : filtres appliqués, page courante, Sheet des filtres et requête.
 * « Appliquer » et « Réinitialiser » reviennent à la page 1 et ferment le Sheet ; comme le Vue, ils
 * rechargent l'historique même si rien n'a changé. Pas d'état dans l'URL (Q-URL).
 */
export function usePointageHistory() {
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_HISTORY_FILTERS)
  const [page, setPage] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const query = useServiceHistoryQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
    isBreak: toIsBreak(filters.type),
    page,
    size: HISTORY_PAGE_SIZE,
  })

  const apply = (next: HistoryFilters) => {
    setFiltersOpen(false)
    if (page === 0 && sameFilters(next, filters)) {
      void query.refetch()
      return
    }
    setFilters(next)
    setPage(0)
  }

  return {
    query,
    filters,
    page,
    changePage: setPage,
    activeFilterCount: countActiveFilters(filters),
    filtersOpen,
    setFiltersOpen,
    apply,
    reset: () => apply(EMPTY_HISTORY_FILTERS),
  }
}
