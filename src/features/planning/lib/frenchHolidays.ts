import { toLocalDateKey } from '@/lib/dates'

/**
 * Jours fériés français du planning : les 11 jours légaux (hors Alsace-Moselle), comme
 * `JoursFeriesService` de l'API.
 *
 * Bug B-03 corrigé (MIGRATION.md 8.2, demande du propriétaire du 27/09/2026) : le Vue calculait
 * les clés des fériés mobiles avec `toISOString()` sur un minuit local, d'où la veille en France
 * (lundi de Pâques affiché le dimanche, Ascension le mercredi, Pentecôte le dimanche). Les clés
 * sont désormais locales.
 */

/** Date de Pâques (algorithme de Meeus/Jones/Butcher), à minuit local. */
export function getEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/** Clé locale `YYYY-MM-DD` de Pâques + `days` jours. */
const easterPlus = (easter: Date, days: number) =>
  toLocalDateKey(new Date(easter.getFullYear(), easter.getMonth(), easter.getDate() + days))

/** Fériés d'une année : clé `YYYY-MM-DD` → nom. */
export function getFrenchHolidays(year: number): Map<string, string> {
  const holidays = new Map<string, string>()

  // Jours fériés fixes
  holidays.set(`${year}-01-01`, "Jour de l'an")
  holidays.set(`${year}-05-01`, 'Fête du travail')
  holidays.set(`${year}-05-08`, 'Victoire 1945')
  holidays.set(`${year}-07-14`, 'Fête nationale')
  holidays.set(`${year}-08-15`, 'Assomption')
  holidays.set(`${year}-11-01`, 'Toussaint')
  holidays.set(`${year}-11-11`, 'Armistice 1918')
  holidays.set(`${year}-12-25`, 'Noël')

  // Jours fériés mobiles (basés sur Pâques)
  const easter = getEasterDate(year)
  holidays.set(easterPlus(easter, 1), 'Lundi de Pâques')
  holidays.set(easterPlus(easter, 39), 'Ascension')
  holidays.set(easterPlus(easter, 50), 'Lundi de Pentecôte')

  return holidays
}
