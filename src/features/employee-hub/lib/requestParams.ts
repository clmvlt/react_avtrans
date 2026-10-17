import type {
  AbsenceSearchParams,
  AbsenceStatus,
  AcompteSearchParams,
  AcompteStatus,
} from '@/services'

/**
 * Bornes « tout l'historique » des recherches de la fiche : sans dates, l'API ne renvoie que les
 * 30 derniers jours et l'avenir (MIGRATION.md 8.3). Une absence n'est trouvée que si elle tient
 * entièrement dans la plage (début ≥ startDate, fin ≤ endDate).
 */
const HISTORY_START = '2000-01-01'
const HISTORY_END = '2100-12-31'

/** Taille des pages des listes de la fiche. */
export const HUB_PAGE_SIZE = 20

/** Demandes en attente affichées d'un coup dans « À traiter ». */
const PENDING_SIZE = 50

/** Absences d'un employé, de la plus récente à la plus ancienne (début). */
export function employeeAbsenceParams(
  userUuid: string,
  status: string,
  page: number,
): AbsenceSearchParams {
  return {
    userUuid,
    startDate: HISTORY_START,
    endDate: HISTORY_END,
    page,
    size: HUB_PAGE_SIZE,
    sortBy: 'startDate',
    sortDirection: 'desc',
    ...(status ? { status: status as AbsenceStatus } : {}),
  }
}

/** Acomptes d'un employé, du plus récent au plus ancien (demande). */
export function employeeAcompteParams(
  userUuid: string,
  status: string,
  page: number,
): AcompteSearchParams {
  return {
    userUuid,
    startDate: HISTORY_START,
    endDate: HISTORY_END,
    page,
    size: HUB_PAGE_SIZE,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    ...(status ? { status: status as AcompteStatus } : {}),
  }
}

/** Absences en attente d'un employé, la plus proche d'abord. */
export const pendingAbsenceParams = (userUuid: string): AbsenceSearchParams => ({
  ...employeeAbsenceParams(userUuid, 'PENDING', 0),
  size: PENDING_SIZE,
  sortDirection: 'asc',
})

/** Acomptes en attente d'un employé, le plus ancien d'abord. */
export const pendingAcompteParams = (userUuid: string): AcompteSearchParams => ({
  ...employeeAcompteParams(userUuid, 'PENDING', 0),
  size: PENDING_SIZE,
  sortDirection: 'ASC',
})

/** Puces de statut des absences de la fiche. */
export const ABSENCE_STATUS_CHIPS = [
  { value: '', label: 'Toutes' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvées' },
  { value: 'REJECTED', label: 'Refusées' },
]

/** Puces de statut des acomptes de la fiche (seuls ces statuts existent côté API). */
export const ACOMPTE_STATUS_CHIPS = [
  { value: '', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'REJECTED', label: 'Refusés' },
]
