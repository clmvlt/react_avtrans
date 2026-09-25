import type { FilterValues } from '@/components/shared/SearchFilters'
import type {
  ServiceModificationAction,
  ServiceModificationDTO,
  ServiceModificationSearchRequest,
  UserDTO,
} from '@/models'
import type { PagedResponse } from '@/types'
import { getServiceModificationActionMeta } from '@/utils/serviceModificationFormatters'

/** Filtres du journal des pointages (dates `YYYY-MM-DD` sur la date de l'action, bornes incluses). */
export type JournalFilterValues = {
  userUuid: string
  modifiedByUuid: string
  action: string
  startDate: string
  endDate: string
}

export const JOURNAL_PAGE_SIZE = 20

export const EMPTY_JOURNAL_FILTERS: JournalFilterValues = {
  userUuid: '',
  modifiedByUuid: '',
  action: '',
  startDate: '',
  endDate: '',
}

const toText = (value: unknown) => (typeof value === 'string' ? value : '')

/** Valeurs renvoyées par SearchFilters → filtres typés. */
export function toJournalFilterValues(values: FilterValues): JournalFilterValues {
  return {
    userUuid: toText(values.userUuid),
    modifiedByUuid: toText(values.modifiedByUuid),
    action: toText(values.action),
    startDate: toText(values.startDate),
    endDate: toText(values.endDate),
  }
}

export const hasActiveJournalFilters = (filters: JournalFilterValues) =>
  Object.values(filters).some((value) => !!value)

/**
 * Texte de la liste vide. Comme le Vue, il reflète les filtres **saisis**, même non appliqués.
 */
export const getJournalEmptyText = (filters: JournalFilterValues) =>
  hasActiveJournalFilters(filters)
    ? 'Aucune action ne correspond aux filtres'
    : 'Aucune action enregistrée'

const fullName = (user?: UserDTO | null): string =>
  `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

/** Options d'un filtre utilisateur, triées par nom. */
export const toUserOptions = (users: UserDTO[]) =>
  users
    .filter((user) => user.uuid && user.firstName)
    .map((user) => ({ value: user.uuid!, label: fullName(user) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'fr'))

/** `YYYY-MM-DD` → `dd/MM/yyyy`, sans passer par Date (aucun décalage de fuseau). */
export const formatDateShort = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-')
  return year && month && day ? `${day}/${month}/${year}` : isoDate
}

/**
 * Indice affiché au-dessus des filtres (« Jean Dupont · par Paul Martin · Ajout · du … au … »).
 * Comme le Vue, il décrit les filtres **saisis**, même non appliqués.
 */
export function getActiveFiltersText(filters: JournalFilterValues, users: UserDTO[]): string {
  const parts: string[] = []

  const employee = users.find((user) => user.uuid === filters.userUuid)
  if (employee) parts.push(fullName(employee))

  const admin = users.find((user) => user.uuid === filters.modifiedByUuid)
  if (admin) parts.push(`par ${fullName(admin)}`)

  if (filters.action) parts.push(getServiceModificationActionMeta(filters.action).label)

  const { startDate, endDate } = filters
  if (startDate && endDate) {
    parts.push(`du ${formatDateShort(startDate)} au ${formatDateShort(endDate)}`)
  } else if (startDate) {
    parts.push(`à partir du ${formatDateShort(startDate)}`)
  } else if (endDate) {
    parts.push(`jusqu'au ${formatDateShort(endDate)}`)
  }

  return parts.length > 0
    ? parts.join(' · ')
    : 'Toutes les actions, de la plus récente à la plus ancienne'
}

/** Corps de POST /services/admin/modifications (filtres vides omis). */
export function buildJournalRequest(
  filters: JournalFilterValues,
  page: number,
): ServiceModificationSearchRequest {
  const request: ServiceModificationSearchRequest = { page, size: JOURNAL_PAGE_SIZE }
  if (filters.userUuid) request.userUuid = filters.userUuid
  if (filters.modifiedByUuid) request.modifiedByUuid = filters.modifiedByUuid
  if (filters.action) request.action = filters.action as ServiceModificationAction
  if (filters.startDate) request.startDate = filters.startDate
  if (filters.endDate) request.endDate = filters.endDate
  return request
}

export type JournalPage = {
  modifications: ServiceModificationDTO[]
  page: number
  totalPages: number
  totalElements: number
  first: boolean
  last: boolean
}

/** Page du journal, avec les replis du Vue quand un champ de pagination manque. */
export function toJournalPage(
  response: PagedResponse<ServiceModificationDTO>,
  requestedPage: number,
): JournalPage {
  const modifications = Array.isArray(response?.content) ? response.content : []
  const page = response?.page ?? requestedPage
  const totalPages = response?.totalPages ?? 0
  return {
    modifications,
    page,
    totalPages,
    totalElements: response?.totalElements ?? modifications.length,
    first: response?.first ?? page === 0,
    last: response?.last ?? page >= totalPages - 1,
  }
}
