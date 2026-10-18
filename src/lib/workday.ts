import { parseLocalDateKey, toLocalDateKey } from './dates'

/**
 * Journée de travail (MIGRATION.md section 16). L'API rattache chaque service à son jour de début
 * et expose la **journée de travail en cours** : aujourd'hui, ou la veille pour un salarié de nuit
 * dont le service est encore en cours ou s'est terminé après minuit, tant qu'il n'a pas repris de
 * service. La règle est calculée par l'API (`date` / `aujourdhui` de `/services/user/daily`,
 * `jour` des heures, `journee` des présences) : ces fonctions ne font que la présenter.
 */

const DAY_MONTH: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' }

/** La journée affichée est-elle celle d'aujourd'hui ? Sans jour connu (ancienne API) : oui. */
export function isWorkdayToday(dayKey: string | null | undefined, todayKey: string): boolean {
  return !dayKey || dayKey === todayKey
}

/** « 12/10 » */
function formatDayMonth(dayKey: string): string {
  return parseLocalDateKey(dayKey)?.toLocaleDateString('fr-FR', DAY_MONTH) ?? dayKey
}

/** « lundi 12/10 » */
function formatWeekdayDayMonth(dayKey: string): string {
  const date = parseLocalDateKey(dayKey)
  if (!date) return dayKey
  return `${date.toLocaleDateString('fr-FR', { weekday: 'long' })} ${formatDayMonth(dayKey)}`
}

/** Titre d'une journée : « Aujourd'hui » ou « Journée du lundi 12/10 (service de nuit) ». */
export function formatWorkdayTitle(dayKey: string | null | undefined, isToday: boolean): string {
  if (isToday || !dayKey) return "Aujourd'hui"
  return `Journée du ${formatWeekdayDayMonth(dayKey)} (service de nuit)`
}

/** Libellé court d'une période « jour » : « Aujourd'hui » ou « Journée du 12/10 ». */
export function formatWorkdayLabel(dayKey: string | null | undefined, todayKey: string): string {
  return isWorkdayToday(dayKey, todayKey) || !dayKey
    ? "Aujourd'hui"
    : `Journée du ${formatDayMonth(dayKey)}`
}

/** Mention à côté d'heures du jour quand elles portent sur la veille : « Journée du 12/10 », sinon vide. */
export function formatOtherWorkdayHint(
  dayKey: string | null | undefined,
  todayKey: string,
): string {
  return isWorkdayToday(dayKey, todayKey) || !dayKey ? '' : `Journée du ${formatDayMonth(dayKey)}`
}

/**
 * Heure d'un pointage dans une journée : « 06:00 », ou « 06:00 (mar. 13/10) » si elle tombe un
 * autre jour que celui de la journée (fin d'un service de nuit). `--:--` si absente ou invalide.
 */
export function formatTimeInWorkday(
  value: Date | string | null | undefined,
  dayKey: string | null | undefined,
): string {
  if (!value) return '--:--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const key = toLocalDateKey(date)
  if (!dayKey || key === dayKey) return time
  const weekday = date.toLocaleDateString('fr-FR', { weekday: 'short' })
  return `${time} (${weekday} ${formatDayMonth(key)})`
}
