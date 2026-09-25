import type { UserWithHoursDTO } from '@/models'

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

/** Entrées avec un utilisateur, aplaties pour le tri. */
export function buildUserHoursRows(entries: UserWithHoursDTO[]): UserHoursRow[] {
  return entries
    .filter((entry) => entry.user != null)
    .map((entry) => ({
      ...entry,
      fullName: `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim(),
      statusSort: entry.user?.status || '',
      hoursDay: entry.hours?.hoursDay || 0,
      hoursWeek: entry.hours?.hoursWeek || 0,
      hoursMonth: entry.hours?.hoursMonth || 0,
      hoursLastMonth: entry.hours?.hoursLastMonth || 0,
      hoursYear: entry.hours?.hoursYear || 0,
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

/** Totaux de tous les employés, sans tenir compte de la recherche (comme le Vue). */
export function computeHoursTotals(entries: UserWithHoursDTO[]): HoursTotals {
  const totals: HoursTotals = { day: 0, week: 0, month: 0, lastMonth: 0, year: 0 }
  for (const entry of entries) {
    if (!entry.hours) continue
    totals.day += entry.hours.hoursDay || 0
    totals.week += entry.hours.hoursWeek || 0
    totals.month += entry.hours.hoursMonth || 0
    totals.lastMonth += entry.hours.hoursLastMonth || 0
    totals.year += entry.hours.hoursYear || 0
  }
  return totals
}

/** Valeur de tri d'une colonne (clés du Vue : fullName, statusSort, hoursDay…). */
export const getUserHoursSortValue = (row: UserHoursRow, columnId: string): unknown =>
  row[columnId as keyof UserHoursRow]
