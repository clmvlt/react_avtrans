import { parseLocalDateKey, toLocalDateKey } from '@/lib/dates'
import type { PlanningQueryParams } from '@/services/absences'
import { getFrenchHolidays } from './frenchHolidays'

/**
 * Calculs de dates du planning, en heure locale de bout en bout.
 *
 * Bug B-03 corrigé (MIGRATION.md 8.2, demande du propriétaire du 27/09/2026) : le Vue mélangeait
 * minuit UTC, `setDate` local et `toISOString()` (jours décalés après le passage à l'heure d'été,
 * clés dupliquées), supposait 52 semaines par an (semaine 53 inaccessible) et combinait l'année
 * civile avec la semaine ISO autour du Nouvel An. Les jours sont maintenant des clés locales
 * `YYYY-MM-DD`, la navigation par semaine suit l'année ISO et ses 52 ou 53 semaines.
 */

export type PlanningPeriodType = 'week' | 'month' | 'custom'

export type PlanningDate = {
  /** Clé locale `YYYY-MM-DD`. */
  dateStr: string
  /** « lun. » */
  dayName: string
  dayNumber: number
  /** 0 = dimanche … 6 = samedi. */
  dayOfWeek: number
  /** « lun. 5 oct. » (info-bulles). */
  label: string
  /** `YYYY-MM` et « Octobre 2026 » (bandeau des mois). */
  monthKey: string
  monthLabel: string
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

/** `YYYY-MM-DD` à partir des composantes locales. */
export const formatLocalKey = toLocalDateKey

/** Numéro de semaine ISO d'une date. */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Année de la semaine ISO (le 30/12/2025 appartient à la semaine 1 de 2026). */
export function getIsoWeekYear(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  return d.getFullYear()
}

/** Nombre de semaines ISO d'une année (52 ou 53 : celle du 28 décembre). */
export const getIsoWeeksInYear = (year: number) => getWeekNumber(new Date(year, 11, 28))

/** Jours affichés de `startDate` à `endDate` (clés `YYYY-MM-DD` incluses). */
export function buildPlanningDates(startDate: string, endDate: string): PlanningDate[] {
  const start = parseLocalDateKey(startDate)
  const end = parseLocalDateKey(endDate)
  if (!start || !end) return []

  const todayStr = toLocalDateKey(new Date())
  const holidays = new Map<string, string>()
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    getFrenchHolidays(year).forEach((name, key) => holidays.set(key, name))
  }

  const result: PlanningDate[] = []
  // Minuit local : `setDate` reste à minuit malgré les changements d'heure
  const current = new Date(start)
  while (current <= end) {
    const dateStr = toLocalDateKey(current)
    const dayOfWeek = current.getDay()
    const holidayName = holidays.get(dateStr)
    const month = current.getMonth()
    result.push({
      dateStr,
      dayName: current.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: current.getDate(),
      dayOfWeek,
      label: current.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }),
      monthKey: `${current.getFullYear()}-${pad2(month + 1)}`,
      monthLabel: `${MONTH_NAMES[month]} ${current.getFullYear()}`,
      isToday: dateStr === todayStr,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isHoliday: !!holidayName,
      holidayName,
    })
    current.setDate(current.getDate() + 1)
  }
  return result
}

/** Mois couverts par les jours affichés, avec leur nombre de jours (bandeau des mois). */
export function groupMonths(dates: PlanningDate[]): { key: string; label: string; span: number }[] {
  const months: { key: string; label: string; span: number }[] = []
  for (const date of dates) {
    const last = months[months.length - 1]
    if (last?.key === date.monthKey) last.span++
    else months.push({ key: date.monthKey, label: date.monthLabel, span: 1 })
  }
  return months
}

/**
 * Densité de la grille selon le nombre de jours : `week` (cases larges, libellés), `month`,
 * `dense` (plages de plus de 31 jours).
 */
export type PlanningDensity = 'week' | 'month' | 'dense'

export function getPlanningDensity(dayCount: number): PlanningDensity {
  if (dayCount <= 7) return 'week'
  if (dayCount <= 31) return 'month'
  return 'dense'
}

/** Largeur minimale d'une colonne de jour (px) : au-delà, les colonnes se partagent la largeur. */
export function getDayColumnMinWidth(dayCount: number): number {
  if (dayCount <= 7) return 56
  if (dayCount <= 31) return 28
  if (dayCount <= 62) return 24
  return 20
}

type PeriodLabelInput = {
  periodType: PlanningPeriodType
  year: number
  month: number
  week: number
  weekYear: number
  startDate?: string
  endDate?: string
}

/** Libellé de la période affichée entre les flèches. */
export function getPeriodLabel({
  periodType,
  year,
  month,
  week,
  weekYear,
  startDate,
  endDate,
}: PeriodLabelInput): string {
  if (periodType === 'week') {
    const start = parseLocalDateKey(startDate ?? '')
    const end = parseLocalDateKey(endDate ?? '')
    if (!start || !end) return `Semaine ${week} - ${weekYear}`
    // « S39 · 21 – 27 sept. 2026 », ou « S53 · 28 déc. – 3 janv. 2027 » à cheval sur deux mois
    const from =
      start.getMonth() === end.getMonth()
        ? String(start.getDate())
        : start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    const to = end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    return `S${week} · ${from} – ${to}`
  }
  return `${MONTH_NAMES[month - 1]} ${year}`
}

/** Période de l'export : « 1 septembre 2026 — 30 septembre 2026 ». */
export function getExportPeriodLabel(startDate: string, endDate: string): string {
  const start = parseLocalDateKey(startDate)
  const end = parseLocalDateKey(endDate)
  if (!start || !end) return ''
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${fmt(start)} — ${fmt(end)}`
}

type PeriodState = {
  periodType: PlanningPeriodType
  year: number
  month: number
  week: number
  weekYear: number
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
    return { periodType: 'week', year: state.weekYear, week: state.week }
  }
  return { periodType: 'month', year: state.year, month: state.month }
}

/** Période précédente (-1) ou suivante (+1) : semaines ISO (52 ou 53 par an) ou mois. */
export function shiftPeriod<
  T extends {
    periodType: PlanningPeriodType
    year: number
    month: number
    week: number
    weekYear: number
  },
>(state: T, direction: -1 | 1): T {
  let { year, month, week, weekYear } = state
  if (state.periodType === 'week') {
    week += direction
    if (week < 1) {
      weekYear--
      week = getIsoWeeksInYear(weekYear)
    } else if (week > getIsoWeeksInYear(weekYear)) {
      weekYear++
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
  return { ...state, year, month, week, weekYear }
}

/** Mois civil et semaine ISO (avec son année) du jour. */
export function getTodayPeriod() {
  const today = new Date()
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    week: getWeekNumber(today),
    weekYear: getIsoWeekYear(today),
  }
}

/** Plage personnalisée par défaut : mois courant et suivant. */
export function getDefaultCustomRange() {
  const today = new Date()
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0)
  return {
    customStartDate: `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-01`,
    customEndDate: toLocalDateKey(endMonth),
  }
}

/** Préréglage « N mois » : du 1er du mois courant à la fin du mois N-1 suivant. */
export function getPresetRange(months: number) {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + months, 0)
  return { customStartDate: toLocalDateKey(start), customEndDate: toLocalDateKey(end) }
}
