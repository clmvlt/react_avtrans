import type { AbsenceTypeDTO, UserDTO } from '@/models'
import type { AbsenceSearchParams, AbsenceStatus } from '@/services'
import { dateRangeHint } from './dateFormat'

/** Taille de page et tri envoyés par le Vue sur les deux listes. */
const BASE_PARAMS = { size: 20, sortBy: 'createdAt', sortDirection: 'desc' } as const

/** Lit une valeur de filtre texte (les filtres `select` et `date` rendent une chaîne ou `''`). */
export const filterText = (value: unknown): string => (typeof value === 'string' ? value : '')

// ─── Page admin (/absences) ─────────────────────────────────────────────────────────────────

/** Valeurs du panneau SearchFilters de la page admin. */
export const EMPTY_ADMIN_ABSENCE_FILTERS: Record<string, unknown> = {
  status: '',
  absenceTypeUuid: '',
  userUuid: '',
  startDate: '',
  endDate: '',
}

/** Libellés du filtre Statut (et du texte d'aide), au féminin pluriel comme le Vue. */
export const ADMIN_ABSENCE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvées' },
  { value: 'REJECTED', label: 'Refusées' },
]

/** Corps de POST /absences/admin/search (`loadAbsences` du Vue) : seuls les filtres renseignés. */
export function toAdminAbsenceParams(
  filters: Record<string, unknown>,
  page: number,
): AbsenceSearchParams {
  const params: AbsenceSearchParams = { page, ...BASE_PARAMS }
  const startDate = filterText(filters.startDate)
  const endDate = filterText(filters.endDate)
  const status = filterText(filters.status)
  const absenceTypeUuid = filterText(filters.absenceTypeUuid)
  const userUuid = filterText(filters.userUuid)
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  if (status) params.status = status as AbsenceStatus
  if (absenceTypeUuid) params.absenceTypeUuid = absenceTypeUuid
  if (userUuid) params.userUuid = userUuid
  return params
}

/**
 * Texte d'aide des filtres admin : « Nom · Statut · Type · du X au Y ». Sans filtre, le Vue
 * annonce « 30 derniers jours affichés » (fenêtre par défaut non vérifiée côté API, 8.3).
 */
export function adminAbsenceFiltersHint(
  filters: Record<string, unknown>,
  users: UserDTO[],
  absenceTypes: AbsenceTypeDTO[],
): string {
  const parts: string[] = []

  const userUuid = filterText(filters.userUuid)
  if (userUuid) {
    const user = users.find((u) => u.uuid === userUuid)
    if (user) parts.push(`${user.firstName} ${user.lastName}`)
  }

  const status = filterText(filters.status)
  if (status) {
    parts.push(ADMIN_ABSENCE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status)
  }

  const absenceTypeUuid = filterText(filters.absenceTypeUuid)
  if (absenceTypeUuid) {
    const type = absenceTypes.find((t) => t.uuid === absenceTypeUuid)
    if (type) parts.push(type.name || '')
  }

  const dates = dateRangeHint(filterText(filters.startDate), filterText(filters.endDate))
  if (dates) parts.push(dates)

  return parts.length > 0 ? parts.join(' · ') : '30 derniers jours affichés'
}

// ─── Mes absences (/myabsences) ─────────────────────────────────────────────────────────────

export type MyAbsenceFilters = {
  status: string
  absenceTypeUuid: string
  startDate: string
  endDate: string
}

export const EMPTY_MY_ABSENCE_FILTERS: MyAbsenceFilters = {
  status: '',
  absenceTypeUuid: '',
  startDate: '',
  endDate: '',
}

/** Puces de statut de « Mes absences ». */
export const MY_ABSENCE_STATUS_CHIPS = [
  { value: '', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvées' },
  { value: 'REJECTED', label: 'Refusées' },
]

/** Corps de POST /absences/my (le service retire en plus les valeurs vides). */
export function toMyAbsenceParams(filters: MyAbsenceFilters, page: number): AbsenceSearchParams {
  const params: AbsenceSearchParams = { page, ...BASE_PARAMS }
  const { startDate, endDate, status, absenceTypeUuid } = filters
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  if (status) params.status = status as AbsenceStatus
  if (absenceTypeUuid) params.absenceTypeUuid = absenceTypeUuid
  return params
}

/**
 * Texte d'aide de « Mes absences ». Sans filtre : « Toutes vos demandes d'absence », alors que
 * le serveur n'affiche que 30 jours par défaut (texte trompeur du Vue, conservé : 8.3).
 */
export function myAbsenceFiltersHint(
  filters: MyAbsenceFilters,
  absenceTypes: AbsenceTypeDTO[],
): string {
  const parts: string[] = []

  if (filters.status) {
    const chip = MY_ABSENCE_STATUS_CHIPS.find((c) => c.value === filters.status)
    if (chip) parts.push(chip.label)
  }

  if (filters.absenceTypeUuid) {
    const type = absenceTypes.find((t) => t.uuid === filters.absenceTypeUuid)
    if (type?.name) parts.push(type.name)
  }

  const dates = dateRangeHint(filters.startDate, filters.endDate)
  if (dates) parts.push(dates)

  return parts.length > 0 ? parts.join(' · ') : "Toutes vos demandes d'absence"
}
