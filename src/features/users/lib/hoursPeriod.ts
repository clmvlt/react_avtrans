import type { HoursQueryParams } from '@/services/userServices'
import { getDateFromISOWeek } from './isoWeek'

/**
 * Logique pure du dialog « Heures travaillées » (UserHoursModal.vue). Accents corrigés (Q-ACCENTS),
 * calculs de dates repris tels quels : bug B-01 reproduit (voir `todayKeyUtc` et `shiftDayKey`).
 */

export type HoursPeriod = 'all' | 'day' | 'week' | 'month' | 'year'

export const HOURS_PERIODS: { value: HoursPeriod; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'day', label: 'Jour' },
  { value: 'week', label: 'Semaine' },
  { value: 'month', label: 'Mois' },
  { value: 'year', label: 'Année' },
]

/**
 * Période affichée. Comme le Vue, une seule année sert aux périodes semaine, mois et année :
 * elle part de l'année ISO de la semaine courante (fausse fin décembre et début janvier).
 */
export type HoursPeriodState = {
  period: HoursPeriod
  year: number
  month: number
  week: number
  /** Jour affiché, `YYYY-MM-DD` */
  dateString: string
}

const MONTH_NAMES = [
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

const MONTH_NAMES_LOWER = MONTH_NAMES.map((name) => name.toLowerCase())

const MONTH_SHORT_NAMES = [
  'jan.',
  'fév.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
]

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

/** Premier choix de l'année dans le sélecteur de mois. */
export const FIRST_SELECTABLE_YEAR = 2020

/** Nom du mois (1 à 12). */
export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? 'Janvier'
}

/**
 * « Aujourd'hui » au format `YYYY-MM-DD`, calculé en **UTC** comme le Vue (`toISOString`) :
 * entre 0 h et 1-2 h (heure de Paris), c'est la veille. Bug B-01 reproduit.
 */
export function todayKeyUtc(now: Date): string {
  return now.toISOString().split('T')[0] ?? ''
}

/**
 * Jour précédent ou suivant, calculé comme le Vue : minuit UTC, décalage en heure locale, retour en
 * UTC. Bug B-01 reproduit : au passage à l'heure d'été le jour suivant reste bloqué (29/03/2026),
 * au passage à l'heure d'hiver le jour précédent en saute un (26/10 → 24/10).
 */
export function shiftDayKey(dateString: string, days: number): string {
  const date = new Date(dateString)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0] ?? ''
}

/** « 25 septembre 2026 » pour le jour affiché (date analysée en UTC, lue en local, comme le Vue). */
export function formatDayDisplay(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getDate()} ${MONTH_NAMES_LOWER[date.getMonth()]} ${date.getFullYear()}`
}

/** Nom du jour de la semaine du jour affiché (« Vendredi »). */
export function formatDayOfWeek(dateString: string): string {
  if (!dateString) return ''
  return DAY_NAMES[new Date(dateString).getDay()] ?? ''
}

/** « 13 jan. » (composantes UTC). */
function formatDateShort(date: Date): string {
  return `${date.getUTCDate()} ${MONTH_SHORT_NAMES[date.getUTCMonth()]}`
}

/** Plage du lundi au dimanche d'une semaine ISO : « 22 sept. - 28 sept. 2026 ». */
export function formatWeekRange(year: number, week: number): string {
  const monday = getDateFromISOWeek(year, week)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  const start = formatDateShort(monday)
  const end = formatDateShort(sunday)
  if (monday.getUTCFullYear() !== sunday.getUTCFullYear()) {
    return `${start} ${monday.getUTCFullYear()} - ${end} ${sunday.getUTCFullYear()}`
  }
  return `${start} - ${end} ${sunday.getUTCFullYear()}`
}

/** Paramètres de GET /services/admin/hours/{uuid} pour la période affichée (loadHoursData). */
export function toHoursQueryParams(state: HoursPeriodState): HoursQueryParams {
  const params: HoursQueryParams = {}
  if (state.period !== 'all') params.period = state.period

  if (state.period === 'day' && state.dateString) {
    const date = new Date(state.dateString)
    params.year = date.getFullYear()
    params.month = date.getMonth() + 1
    params.day = date.getDate()
  } else if (state.period === 'week') {
    params.year = state.year
    params.week = state.week
  } else if (state.period === 'month') {
    params.year = state.year
    params.month = state.month
  } else if (state.period === 'year') {
    params.year = state.year
  }
  return params
}

/**
 * Heures décimales en « 7h 05m », « - » si absentes. Bug B-18 reproduit : l'arrondi des minutes
 * peut donner « 7h 60m ».
 */
export function formatHoursValue(hours?: number | null): string {
  if (hours === null || hours === undefined) return '-'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m.toString().padStart(2, '0')}m`
}
