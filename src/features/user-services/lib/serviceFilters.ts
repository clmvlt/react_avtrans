import type { ServiceSearchParams } from '@/services'

/** Filtre « Type » des pointages d'un employé. */
export type ServiceTypeFilter = 'all' | 'service' | 'pause'

/** Filtres saisis dans le panneau (dates `YYYY-MM-DD`, vides = sans borne). */
export type AdminServiceFilters = {
  startDate: string
  endDate: string
  type: ServiceTypeFilter
}

export const EMPTY_SERVICE_FILTERS: AdminServiceFilters = {
  startDate: '',
  endDate: '',
  type: 'all',
}

export const SERVICE_TYPE_OPTIONS: { value: ServiceTypeFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'service', label: 'Services' },
  { value: 'pause', label: 'Pauses' },
]

/** Taille de page des pointages (fixe dans le Vue). */
export const SERVICES_PAGE_SIZE = 20

/** Au moins un filtre renseigné (bouton « Filtres » mis en avant). */
export function hasActiveServiceFilters(filters: AdminServiceFilters): boolean {
  return filters.startDate !== '' || filters.endDate !== '' || filters.type !== 'all'
}

/**
 * Corps de POST /services/admin/user/{uuid}, construit comme useUserServices.ts : dates envoyées en
 * date-heure (`T00:00:00` / `T23:59:59`), tri par début décroissant. Sans dates, l'API ne renvoie
 * que les 30 derniers jours (limite connue, MIGRATION.md 8.3).
 */
export function toServicesSearchBody(
  filters: AdminServiceFilters,
  page: number,
): ServiceSearchParams {
  const body: ServiceSearchParams = {
    page,
    size: SERVICES_PAGE_SIZE,
    sortBy: 'debut',
    sortDirection: 'desc',
  }
  if (filters.startDate) body.startDate = `${filters.startDate}T00:00:00`
  if (filters.endDate) body.endDate = `${filters.endDate}T23:59:59`
  if (filters.type === 'pause') body.isBreak = true
  else if (filters.type === 'service') body.isBreak = false
  return body
}
