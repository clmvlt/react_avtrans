import { addDaysToKey } from '@/lib/dates'
import type { AbsenceDTO, ModeDecompte } from '@/models'
import type { PlanningDate } from './planningDates'

/**
 * Jours d'absence du planning (D8, MIGRATION.md section 12). Les règles recopient
 * `HeuresAbsenceCalculator` de l'API **pour l'affichage seulement** ; les heures viennent toujours
 * de l'API (`absence.heures`, `absence.joursDecomptes`) :
 * - jours ouvrables (défaut) : dimanches et fériés non décomptés ; une absence en journée
 *   complète qui finit un vendredi décompte aussi le samedi suivant (reprise), s'il n'est pas
 *   férié ;
 * - jours ouvrés : samedis, dimanches et fériés non décomptés ;
 * - jours calendaires : tous les jours décomptés.
 */

export type AbsenceDayKind = 'decompte' | 'non-decompte' | 'reprise'

export type AbsenceDayMotif = 'DIMANCHE' | 'SAMEDI' | 'FERIE' | null

export type PlanningAbsenceDay = {
  absence: AbsenceDTO
  kind: AbsenceDayKind
  /** Raison d'un jour non décompté. */
  motif: AbsenceDayMotif
  /** 0 (non décompté), 0,5 (demi-journée) ou 1. */
  fraction: number
  /** Heures créditées ce jour : heures de l'absence au prorata des jours décomptés. */
  heures: number
  /** Début et fin de la barre affichée (coins arrondis). */
  isStart: boolean
  isEnd: boolean
}

const dateOnly = (value: string | undefined) => String(value ?? '').split('T')[0] ?? ''

const modeOf = (absence: AbsenceDTO): ModeDecompte => absence.modeDecompte ?? 'JOURS_OUVRABLES'

function motifExclusion(date: PlanningDate, mode: ModeDecompte): AbsenceDayMotif {
  if (mode === 'JOURS_CALENDAIRES') return null
  if (date.isHoliday) return 'FERIE'
  if (date.dayOfWeek === 0) return 'DIMANCHE'
  if (date.dayOfWeek === 6 && mode === 'JOURS_OUVRES') return 'SAMEDI'
  return null
}

/** Heures d'un jour décompté : répartition au prorata, comme l'API. */
function heuresDuJour(absence: AbsenceDTO, fraction: number): number {
  const jours = absence.joursDecomptes ?? 0
  if (jours <= 0 || fraction <= 0) return 0
  return ((absence.heures ?? 0) * fraction) / jours
}

/** L'absence finit-elle la veille de ce samedi (samedi de reprise, jours ouvrables) ? */
function isRepriseSaturday(absence: AbsenceDTO, date: PlanningDate): boolean {
  return (
    date.dayOfWeek === 6 &&
    !date.isHoliday &&
    modeOf(absence) === 'JOURS_OUVRABLES' &&
    (absence.period ?? 'FULL_DAY') === 'FULL_DAY' &&
    addDaysToKey(dateOnly(absence.endDate), 1) === date.dateStr
  )
}

/**
 * Jour par jour, l'absence d'un employé et son statut de décompte, pour les jours affichés.
 * Une absence couvrant le jour l'emporte sur le samedi de reprise d'une autre.
 */
export function buildAbsenceDayMap(
  absences: AbsenceDTO[] | undefined,
  dates: PlanningDate[],
): Map<string, PlanningAbsenceDay> {
  const map = new Map<string, PlanningAbsenceDay>()
  if (!absences?.length) return map

  for (const date of dates) {
    const covering = absences.find(
      (a) => dateOnly(a.startDate) <= date.dateStr && date.dateStr <= dateOnly(a.endDate),
    )
    if (covering) {
      const motif = motifExclusion(date, modeOf(covering))
      const fraction = motif ? 0 : (covering.period ?? 'FULL_DAY') === 'FULL_DAY' ? 1 : 0.5
      map.set(date.dateStr, {
        absence: covering,
        kind: motif ? 'non-decompte' : 'decompte',
        motif,
        fraction,
        heures: heuresDuJour(covering, fraction),
        isStart: true,
        isEnd: true,
      })
      continue
    }
    const reprise = absences.find((a) => isRepriseSaturday(a, date))
    if (reprise) {
      map.set(date.dateStr, {
        absence: reprise,
        kind: 'reprise',
        motif: null,
        fraction: 1,
        heures: heuresDuJour(reprise, 1),
        isStart: true,
        isEnd: true,
      })
    }
  }

  // Continuité d'une même absence sur deux jours affichés consécutifs : les jours de même nature
  // forment une seule barre ; un trait (jour non décompté) se raccorde aux barres voisines, qui
  // restent fermées ; une barre pleine et un samedi de reprise restent deux barres distinctes.
  for (let i = 1; i < dates.length; i++) {
    const previous = map.get(dates[i - 1]!.dateStr)
    const current = map.get(dates[i]!.dateStr)
    if (!previous || !current || previous.absence !== current.absence) continue
    if (previous.kind === current.kind) {
      previous.isEnd = false
      current.isStart = false
    } else {
      if (current.kind === 'non-decompte') current.isStart = false
      if (previous.kind === 'non-decompte') previous.isEnd = false
    }
  }
  return map
}

/** Un jour qui compte comme absence (décompté ou samedi de reprise). */
export const isCountedDay = (day: PlanningAbsenceDay | undefined) =>
  !!day && day.kind !== 'non-decompte'

export type UserPeriodSummary = {
  /** Absences approuvées : jours décomptés et heures créditées sur la période. */
  jours: number
  heures: number
  /** Jours décomptés des absences en attente. */
  joursEnAttente: number
}

export function summarizeUserPeriod(dayMap: Map<string, PlanningAbsenceDay>): UserPeriodSummary {
  const summary: UserPeriodSummary = { jours: 0, heures: 0, joursEnAttente: 0 }
  for (const day of dayMap.values()) {
    if (!isCountedDay(day)) continue
    if (day.absence.status === 'APPROVED') {
      summary.jours += day.fraction
      summary.heures += day.heures
    } else if (day.absence.status === 'PENDING') {
      summary.joursEnAttente += day.fraction
    }
  }
  return summary
}

export type DayAbsentCount = { total: number; enAttente: number }

/** Nombre d'employés absents chaque jour (jours décomptés ou de reprise). */
export function countAbsentsByDay(
  dayMaps: Map<string, PlanningAbsenceDay>[],
  dates: PlanningDate[],
): Map<string, DayAbsentCount> {
  const counts = new Map<string, DayAbsentCount>()
  for (const date of dates) {
    const count: DayAbsentCount = { total: 0, enAttente: 0 }
    for (const dayMap of dayMaps) {
      const day = dayMap.get(date.dateStr)
      if (!isCountedDay(day)) continue
      count.total++
      if (day?.absence.status === 'PENDING') count.enAttente++
    }
    counts.set(date.dateStr, count)
  }
  return counts
}
