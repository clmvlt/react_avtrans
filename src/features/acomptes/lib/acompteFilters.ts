import { dateRangeHint } from '@/features/absences/lib/dateFormat'
import type { UserDTO } from '@/models'
import type { AcompteSearchParams, AcompteStatus } from '@/services'

/** Taille de page et tri envoyés par le Vue sur les deux listes. */
const BASE_PARAMS = { size: 20, sortBy: 'createdAt', sortDirection: 'DESC' } as const

const filterText = (value: unknown): string => (typeof value === 'string' ? value : '')

// ─── Page admin (/acomptes) ─────────────────────────────────────────────────────────────────

/** Valeurs du panneau SearchFilters de la page admin (`number` : nombre ou `''`). */
export const EMPTY_ADMIN_ACOMPTE_FILTERS: Record<string, unknown> = {
  status: '',
  userUuid: '',
  montantMin: '',
  montantMax: '',
  startDate: '',
  endDate: '',
}

/**
 * Filtre Statut de la page admin, au masculin pluriel. « Annulés » envoie `CANCELLED`, statut
 * inexistant côté API (risque de 500) : bug B-09 reproduit, non autorisé.
 */
export const ADMIN_ACOMPTE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'REJECTED', label: 'Refusés' },
  { value: 'CANCELLED', label: 'Annulés' },
]

/** Corps de POST /acomptes/admin/search (`loadAcomptes` du Vue) : seuls les filtres renseignés. */
export function toAdminAcompteParams(
  filters: Record<string, unknown>,
  page: number,
): AcompteSearchParams {
  const params: AcompteSearchParams = { page, ...BASE_PARAMS }
  const startDate = filterText(filters.startDate)
  const endDate = filterText(filters.endDate)
  const status = filterText(filters.status)
  const userUuid = filterText(filters.userUuid)
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  if (status) params.status = status as AcompteStatus
  if (userUuid) params.userUuid = userUuid
  // Montant vide ou 0 ignoré (`if (montantMin)` du Vue)
  if (filters.montantMin) params.montantMin = Number.parseFloat(String(filters.montantMin))
  if (filters.montantMax) params.montantMax = Number.parseFloat(String(filters.montantMax))
  return params
}

/**
 * Texte d'aide des filtres admin : « Nom · Statut · min€ - max€ · du X au Y » (« > min€ »,
 * « < max€ » alors que le filtre est inclusif, comme le Vue). Sans filtre :
 * « 30 derniers jours affichés » (fenêtre par défaut, 8.3).
 */
export function adminAcompteFiltersHint(
  filters: Record<string, unknown>,
  users: UserDTO[],
): string {
  const parts: string[] = []

  const userUuid = filterText(filters.userUuid)
  if (userUuid) {
    const user = users.find((u) => u.uuid === userUuid)
    if (user) parts.push(`${user.firstName} ${user.lastName}`)
  }

  const status = filterText(filters.status)
  if (status) {
    parts.push(ADMIN_ACOMPTE_STATUS_OPTIONS.find((o) => o.value === status)?.label || status)
  }

  const { montantMin, montantMax } = filters
  if (montantMin && montantMax) parts.push(`${String(montantMin)}€ - ${String(montantMax)}€`)
  else if (montantMin) parts.push(`> ${String(montantMin)}€`)
  else if (montantMax) parts.push(`< ${String(montantMax)}€`)

  const dates = dateRangeHint(filterText(filters.startDate), filterText(filters.endDate))
  if (dates) parts.push(dates)

  return parts.length > 0 ? parts.join(' · ') : '30 derniers jours affichés'
}

// ─── Mes acomptes (/myacomptes) ─────────────────────────────────────────────────────────────

/** Filtres de « Mes acomptes » (montants gardés en texte, comme les champs du Vue). */
export type MyAcompteFilters = {
  status: string
  montantMin: string
  montantMax: string
  startDate: string
  endDate: string
}

export const EMPTY_MY_ACOMPTE_FILTERS: MyAcompteFilters = {
  status: '',
  montantMin: '',
  montantMax: '',
  startDate: '',
  endDate: '',
}

/** Puces de statut de « Mes acomptes » (seuls PENDING, APPROVED, REJECTED existent côté API). */
export const MY_ACOMPTE_STATUS_CHIPS = [
  { value: '', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'REJECTED', label: 'Refusés' },
]

/** Corps de POST /acomptes/my : statut en liste blanche, montants non numériques ignorés. */
export function toMyAcompteParams(filters: MyAcompteFilters, page: number): AcompteSearchParams {
  const params: AcompteSearchParams = { page, ...BASE_PARAMS }
  const { startDate, endDate, status, montantMin, montantMax } = filters
  if (startDate) params.startDate = startDate
  if (endDate) params.endDate = endDate
  if (status === 'PENDING' || status === 'APPROVED' || status === 'REJECTED') {
    params.status = status
  }
  const min = Number.parseFloat(montantMin)
  const max = Number.parseFloat(montantMax)
  if (!Number.isNaN(min)) params.montantMin = min
  if (!Number.isNaN(max)) params.montantMax = max
  return params
}

/**
 * Texte d'aide de « Mes acomptes ». Sans filtre : « Toutes vos demandes d'acompte », alors que
 * le serveur n'affiche que 30 jours par défaut (texte du Vue conservé, 8.3).
 */
export function myAcompteFiltersHint(filters: MyAcompteFilters): string {
  const parts: string[] = []

  if (filters.status) {
    const chip = MY_ACOMPTE_STATUS_CHIPS.find((c) => c.value === filters.status)
    if (chip) parts.push(chip.label)
  }

  const { montantMin, montantMax } = filters
  if (montantMin && montantMax) parts.push(`${montantMin} € à ${montantMax} €`)
  else if (montantMin) parts.push(`≥ ${montantMin} €`)
  else if (montantMax) parts.push(`≤ ${montantMax} €`)

  const dates = dateRangeHint(filters.startDate, filters.endDate)
  if (dates) parts.push(dates)

  return parts.length > 0 ? parts.join(' · ') : "Toutes vos demandes d'acompte"
}
