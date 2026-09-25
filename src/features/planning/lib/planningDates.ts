import type { PlanningQueryParams } from '@/services/absences'
import { getFrenchHolidays } from './frenchHolidays'

/**
 * Calculs de dates du planning, portés à l'identique de Planning.vue.
 *
 * Bug B-03 reproduit (MIGRATION.md 8.2, non autorisé à la correction) :
 * - `buildPlanningDates` mélange un départ en minuit UTC (`new Date('YYYY-MM-DD')`), `setDate`
 *   local et `toISOString()` : après le passage à l'heure d'été, `dateStr` retarde d'un jour sur
 *   `dayNumber` (clés dupliquées, absences et « aujourd'hui » sur le mauvais jour) ;
 * - la navigation par semaine suppose 52 semaines (semaine 53 inaccessible) ;
 * - « Aujourd'hui » combine l'année civile et la semaine ISO (mauvaise période autour du Nouvel An).
 */

export type PlanningPeriodType = 'week' | 'month' | 'custom'

export type PlanningDate = {
  dateStr: string
  dayName: string
  dayNumber: number
  isToday: boolean
  isWeekend: boolean
  isHoliday: boolean
  holidayName?: string
}

export const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const pad2 = (value: number) => String(value).padStart(2, '0')

/** `YYYY-MM-DD` à partir des composantes locales (formatage du Vue pour la plage personnalisée). */
export const formatLocalKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

/** Numéro de semaine ISO d'une date (getWeekNumber du Vue). */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Colonnes de la liste des jours (computed `dates` du Vue, B-03 compris). */
export function buildPlanningDates(startDate: string, endDate: string): PlanningDate[] {
  if (!startDate || !endDate) return []

  const result: PlanningDate[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()
  const todayStr = formatLocalKey(today)

  // Jours fériés des années concernées
  const holidays = new Map<string, string>()
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    getFrenchHolidays(year).forEach((name, date) => holidays.set(date, name))
  }

  const current = new Date(start)
  while (current <= end) {
    const dayOfWeek = current.getDay()
    const currentStr = current.toISOString().split('T')[0] || ''
    const holidayName = holidays.get(currentStr)
    result.push({
      dateStr: currentStr,
      dayName: current.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: current.getDate(),
      isToday: currentStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isHoliday: !!holidayName,
      holidayName,
    })
    current.setDate(current.getDate() + 1)
  }
  return result
}

/** Colonnes de la grille : largeur minimale adaptée au nombre de jours. */
export function getGridColumns(dayCount: number): string {
  let minCol = 44
  if (dayCount > 60) minCol = 24
  else if (dayCount > 45) minCol = 28
  else if (dayCount > 31) minCol = 32
  return `200px repeat(${dayCount}, minmax(${minCol}px, 1fr))`
}

/** Grille compacte au-delà de 31 jours (initiale du jour, pas d'AM/PM). */
export const isCompactGrid = (dayCount: number) => dayCount > 31

type PeriodLabelInput = {
  periodType: PlanningPeriodType
  year: number
  month: number
  week: number
  startDate?: string
  endDate?: string
}

/** Libellé de la période affichée entre les flèches (currentPeriodLabel du Vue). */
export function getPeriodLabel({
  periodType,
  year,
  month,
  week,
  startDate,
  endDate,
}: PeriodLabelInput): string {
  if (periodType === 'week') {
    if (!startDate || !endDate) return `Semaine ${week} - ${year}`
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  return `${MONTH_NAMES[month - 1]} ${year}`
}

/** Période de l'export : « 1 septembre 2026 — 30 septembre 2026 ». */
export function getExportPeriodLabel(startDate: string, endDate: string): string {
  if (!startDate || !endDate) return ''
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${fmt(new Date(startDate))} — ${fmt(new Date(endDate))}`
}

type PeriodState = {
  periodType: PlanningPeriodType
  year: number
  month: number
  week: number
  customStartDate: string
  customEndDate: string
}

/** Paramètres de GET /absences/admin/planning (aucune clé `undefined` : URLSearchParams les écrirait). */
export function buildPlanningParams(state: PeriodState): PlanningQueryParams {
  if (state.periodType === 'custom') {
    return {
      periodType: 'custom',
      startDate: state.customStartDate,
      endDate: state.customEndDate,
    }
  }
  if (state.periodType === 'week') {
    return { periodType: 'week', year: state.year, week: state.week }
  }
  return { periodType: 'month', year: state.year, month: state.month }
}

/** Période précédente (-1) ou suivante (+1), avec le bouclage à 52 semaines du Vue (B-03). */
export function shiftPeriod<
  T extends { periodType: PlanningPeriodType; year: number; month: number; week: number },
>(state: T, direction: -1 | 1): T {
  let { year, month, week } = state
  if (state.periodType === 'week') {
    week += direction
    if (week < 1) {
      year--
      week = 52
    } else if (week > 52) {
      year++
      week = 1
    }
  } else {
    month += direction
    if (month < 1) {
      year--
      month = 12
    } else if (month > 12) {
      year++
      month = 1
    }
  }
  return { ...state, year, month, week }
}

/** Année civile, mois et semaine ISO du jour (goToToday du Vue, B-03). */
export function getTodayPeriod() {
  const today = new Date()
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    week: getWeekNumber(today),
  }
}

/** Plage personnalisée par défaut : mois courant et suivant. */
export function getDefaultCustomRange() {
  const today = new Date()
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  return {
    customStartDate: `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-01`,
    customEndDate: formatLocalKey(endMonth),
  }
}

/** Préréglage « N mois » : du 1er du mois courant à la fin du mois N-1 suivant. */
export function getPresetRange(months: number) {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + months, 0)
  return { customStartDate: formatLocalKey(start), customEndDate: formatLocalKey(end) }
}
