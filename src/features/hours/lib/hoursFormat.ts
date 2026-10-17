import { isPeriodRunning, livePeriodHours } from '@/lib/liveCounter'
import type { UserHoursDTO, UserWithHoursDTO } from '@/models'

/** Ligne de la page Heures : entrée de l'API + champs à plat pour le tri et l'affichage. */
export type UserHoursRow = UserWithHoursDTO & {
  fullName: string
  statusSort: string
  hoursDay: number
  hoursWeek: number
  hoursMonth: number
  hoursLastMonth: number
  hoursYear: number
}

export type HoursTotals = {
  day: number
  week: number
  month: number
  lastMonth: number
  year: number
}

/** Heures décimales de la page Heures : « 7.5h », « 0h » (format propre à cette page). */
export function formatDecimalHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || hours === 0) return '0h'
  return `${hours.toFixed(1)}h`
}

/** Couleur d'un compteur : 0 grisé, moins de 4 h en ambre, sinon violet. */
export function getHoursClass(hours: number | null | undefined): string {
  if (!hours || hours === 0) return 'text-muted-foreground'
  if (hours < 4) return 'text-amber-600 dark:text-amber-400'
  return 'text-violet-600 dark:text-violet-400'
}

const PERIOD_KEYS = ['hoursDay', 'hoursWeek', 'hoursMonth', 'hoursLastMonth', 'hoursYear'] as const

/** Au moins un compteur d'un employé avance (service en cours hors pause). */
export function hasRunningHours(entries: UserWithHoursDTO[]): boolean {
  return entries.some((entry) => PERIOD_KEYS.some((key) => isPeriodRunning(entry.hours?.[key])))
}

/** Heures décimales d'une période (D12 : `HeuresPeriodeDTO`), en direct si elle est en cours. */
const periodHours = (
  hours: UserHoursDTO | undefined,
  key: (typeof PERIOD_KEYS)[number],
  elapsed: number,
) => livePeriodHours(hours?.[key], elapsed)

/**
 * Entrées avec un utilisateur, aplaties pour le tri. `elapsed` (secondes depuis la réception) fait
 * avancer les périodes en cours.
 */
export function buildUserHoursRows(entries: UserWithHoursDTO[], elapsed = 0): UserHoursRow[] {
  return entries
    .filter((entry) => entry.user != null)
    .map((entry) => ({
      ...entry,
      fullName: `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim(),
      statusSort: entry.user?.status || '',
      hoursDay: periodHours(entry.hours, 'hoursDay', elapsed),
      hoursWeek: periodHours(entry.hours, 'hoursWeek', elapsed),
      hoursMonth: periodHours(entry.hours, 'hoursMonth', elapsed),
      hoursLastMonth: periodHours(entry.hours, 'hoursLastMonth', elapsed),
      hoursYear: periodHours(entry.hours, 'hoursYear', elapsed),
    }))
}

/** Recherche sur le nom complet et l'e-mail (insensible à la casse). */
export function filterUserHoursRows(rows: UserHoursRow[], search: string): UserHoursRow[] {
  if (!search.trim()) return rows
  const query = search.toLowerCase()
  return rows.filter(
    (row) =>
      row.fullName.toLowerCase().includes(query) ||
      (row.user?.email || '').toLowerCase().includes(query),
  )
}

/** Totaux de tous les employés, sans tenir compte de la recherche (comme le Vue), en direct. */
export function computeHoursTotals(entries: UserWithHoursDTO[], elapsed = 0): HoursTotals {
  const totals: HoursTotals = { day: 0, week: 0, month: 0, lastMonth: 0, year: 0 }
  for (const entry of entries) {
    if (!entry.hours) continue
    totals.day += periodHours(entry.hours, 'hoursDay', elapsed)
    totals.week += periodHours(entry.hours, 'hoursWeek', elapsed)
    totals.month += periodHours(entry.hours, 'hoursMonth', elapsed)
    totals.lastMonth += periodHours(entry.hours, 'hoursLastMonth', elapsed)
    totals.year += periodHours(entry.hours, 'hoursYear', elapsed)
  }
  return totals
}

/** Valeur de tri d'une colonne (clés du Vue : fullName, statusSort, hoursDay…). */
export const getUserHoursSortValue = (row: UserHoursRow, columnId: string): unknown =>
  row[columnId as keyof UserHoursRow]
