import type { AbsenceDTO } from '@/models'
import type { PlanningDate } from './planningDates'

/**
 * Absence d'un employé couvrant un jour (getAbsenceForDate du Vue) : la première de la liste dont
 * l'intervalle `[startDate, endDate]` contient le jour, les trois dates lues en minuit UTC
 * (`new Date('YYYY-MM-DD')`), comme le Vue.
 */
export function findAbsenceForDate(
  absences: AbsenceDTO[] | undefined,
  dateStr: string,
): AbsenceDTO | undefined {
  if (!absences) return undefined
  const current = new Date(dateStr)
  return absences.find((absence) => {
    const start = new Date(absence.startDate || '')
    const end = new Date(absence.endDate || '')
    return current >= start && current <= end
  })
}

/**
 * Index `dateStr → absence` d'un employé pour les jours affichés : une seule recherche par jour
 * (le Vue refaisait la recherche jusqu'à six fois par cellule). Même résultat que
 * `findAbsenceForDate`, y compris pour les `dateStr` dupliqués du bug B-03.
 */
export function indexAbsencesByDate(
  absences: AbsenceDTO[] | undefined,
  dates: PlanningDate[],
): Map<string, AbsenceDTO | undefined> {
  const index = new Map<string, AbsenceDTO | undefined>()
  for (const date of dates) {
    if (!index.has(date.dateStr))
      index.set(date.dateStr, findAbsenceForDate(absences, date.dateStr))
  }
  return index
}
