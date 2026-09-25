import { useState } from 'react'
import { useSearchParams } from 'react-router'
import type { FilterValues } from '@/components/shared/SearchFilters'
import type { CouchetteSearchParams } from '@/services'
import { useAdminCouchettesQuery } from '../api/useAdminCouchettesQuery'

const PAGE_SIZE = 20

type CouchetteFilters = {
  userUuid: string
  startDate: string
  endDate: string
}

type AppliedSearch = {
  filters: CouchetteFilters
  page: number
}

const EMPTY_FILTERS: CouchetteFilters = { userUuid: '', startDate: '', endDate: '' }

const asText = (value: unknown) => (typeof value === 'string' ? value : '')

const toFilters = (values: FilterValues): CouchetteFilters => ({
  userUuid: asText(values.userUuid),
  startDate: asText(values.startDate),
  endDate: asText(values.endDate),
})

const isSameSearch = (a: AppliedSearch, b: AppliedSearch) =>
  a.page === b.page &&
  a.filters.userUuid === b.filters.userUuid &&
  a.filters.startDate === b.filters.startDate &&
  a.filters.endDate === b.filters.endDate

/**
 * État de /couchettes (admin) : filtres saisis, recherche envoyée et requête paginée.
 *
 * Comme le Vue, chaque chargement (Rechercher, pagination, après création ou suppression) part
 * des filtres **saisis** au moment du clic, appliqués ou non. Le filtre employé est prérempli par
 * `?userUuid=` à l'arrivée, puis repris quand ce paramètre change pour une nouvelle valeur
 * (son retrait est ignoré, comme le `watch` du Vue). Rien n'est écrit dans l'URL (Q-URL).
 */
export function useAdminCouchettes() {
  const [searchParams] = useSearchParams()
  const urlUserUuid = searchParams.get('userUuid') ?? ''

  const [draft, setDraft] = useState<FilterValues>(() => ({
    ...EMPTY_FILTERS,
    userUuid: urlUserUuid,
  }))
  const [applied, setApplied] = useState<AppliedSearch>(() => ({
    filters: { ...EMPTY_FILTERS, userUuid: urlUserUuid },
    page: 0,
  }))
  const [seenUrlUserUuid, setSeenUrlUserUuid] = useState(urlUserUuid)

  // Nouveau `?userUuid=` pendant qu'on est sur la page : filtre repris, retour en page 1.
  if (urlUserUuid !== seenUrlUserUuid) {
    setSeenUrlUserUuid(urlUserUuid)
    if (urlUserUuid) {
      const next = { ...draft, userUuid: urlUserUuid }
      setDraft(next)
      setApplied({ filters: toFilters(next), page: 0 })
    }
  }

  const { filters, page } = applied
  const params: CouchetteSearchParams = {
    page,
    size: PAGE_SIZE,
    sortBy: 'date',
    sortDirection: 'desc',
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.userUuid && { userUuid: filters.userUuid }),
  }
  const query = useAdminCouchettesQuery(params)

  /**
   * Charge `page` avec les filtres saisis. Même recherche que l'actuelle : rechargée seulement si
   * `refetchIfUnchanged` (bouton Rechercher) ; après une mutation, l'invalidation s'en charge.
   */
  const load = (nextPage: number, { refetchIfUnchanged = false } = {}) => {
    const next: AppliedSearch = { filters: toFilters(draft), page: nextPage }
    if (!isSameSearch(next, applied)) setApplied(next)
    else if (refetchIfUnchanged) void query.refetch()
  }

  const reset = () => {
    setDraft({ ...EMPTY_FILTERS })
    const next: AppliedSearch = { filters: { ...EMPTY_FILTERS }, page: 0 }
    if (!isSameSearch(next, applied)) setApplied(next)
    else void query.refetch()
  }

  const data = query.data
  const pagination = {
    currentPage: data?.page || 0,
    totalPages: data?.totalPages || 1,
    totalElements: data?.totalElements || 0,
  }

  return {
    /** Filtres saisis (valeur de `SearchFilters`). */
    draft,
    setDraft,
    /** Employé saisi, gardé dans les options du filtre même s'il est masqué. */
    selectedUserUuid: asText(draft.userUuid),
    query,
    couchettes: data?.content ?? [],
    pagination,
    /** Rechercher : page 1 avec les filtres saisis. */
    search: () => load(0, { refetchIfUnchanged: true }),
    reset,
    goToPage: (nextPage: number) => load(nextPage),
    /** Après une création : page 1 ; après une suppression : page courante. */
    reload: (nextPage: number) => load(nextPage),
  }
}
