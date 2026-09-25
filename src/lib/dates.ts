/**
 * Dates « calendaires » en heure locale, au format `YYYY-MM-DD` des `<input type="date">` et de l'API.
 *
 * Aucune de ces fonctions n'utilise `toISOString()`, qui convertit en UTC : sur un minuit local
 * (ou entre 0 h et 2 h en France), il renvoie la veille. C'est le bug B-01 du Vue
 * (MIGRATION.md 8.2 : export des heures, dates préremplies, UserHoursModal…).
 *
 * Important : B-01 n'est pas encore autorisé à être corrigé. Les écrans qui avaient le bug
 * gardent la logique Vue d'origine (`getTodayDate()` de `utils/timeFormatters`, `toISOString()`)
 * tant que le propriétaire n'a pas donné son accord. Ces helpers servent au code nouveau ou aux
 * écrans qui calculaient déjà en local dans le Vue (ex. `localDateKey` de Pointage.vue).
 */

const pad2 = (value: number) => String(value).padStart(2, '0')

/** Clé `YYYY-MM-DD` d'une date, en heure locale. */
export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Date du jour `YYYY-MM-DD` en heure locale (valeur par défaut d'un `<input type="date">`). */
export function todayLocalISO(): string {
  return toLocalDateKey(new Date())
}

/**
 * Convertit une clé `YYYY-MM-DD` en `Date` à minuit **local** (`new Date('2026-09-25')` donnerait
 * minuit UTC). Renvoie `null` si la clé est mal formée.
 */
export function parseLocalDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Ajoute `days` jours (négatif possible) à une clé `YYYY-MM-DD`, sans décalage au changement d'heure. */
export function addDaysToKey(key: string, days: number): string {
  const date = parseLocalDateKey(key)
  if (!date) return key
  date.setDate(date.getDate() + days)
  return toLocalDateKey(date)
}
