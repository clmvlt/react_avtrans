/**
 * Semaines ISO 8601 (repris tels quels de UserHoursModal.vue, calculs en UTC).
 */

/** Numéro de semaine ISO d'une date (d'après ses composantes locales). */
export function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/** Année ISO (peut différer de l'année civile fin décembre et début janvier). */
export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  return d.getUTCFullYear()
}

/** Lundi (minuit UTC) d'une semaine ISO. */
export function getDateFromISOWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const dayOfWeek = jan4.getUTCDay() || 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7)
  return monday
}

/** Nombre de semaines ISO d'une année (52 ou 53). */
export function getISOWeeksInYear(year: number): number {
  const week = getISOWeek(new Date(Date.UTC(year, 11, 31)))
  return week === 1 ? getISOWeek(new Date(Date.UTC(year, 11, 24))) : week
}
