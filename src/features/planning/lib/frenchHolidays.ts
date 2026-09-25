/**
 * Jours fériés français du planning (port exact de Planning.vue).
 *
 * Bug B-03 reproduit (MIGRATION.md 8.2, non autorisé à la correction) : les fériés mobiles
 * passent par `toISOString()` sur un minuit **local**. En France (UTC+1 / UTC+2), la clé obtenue
 * est celle de la veille : Lundi de Pâques affiché le dimanche, Ascension le mercredi, Lundi de
 * Pentecôte le dimanche.
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

  // Jours fériés mobiles (basés sur Pâques) : clés en UTC, comme le Vue (B-03)
  const easter = getEasterDate(year)

  const easterMonday = new Date(easter)
  easterMonday.setDate(easter.getDate() + 1)
  holidays.set(easterMonday.toISOString().split('T')[0]!, 'Lundi de Pâques')

  const ascension = new Date(easter)
  ascension.setDate(easter.getDate() + 39)
  holidays.set(ascension.toISOString().split('T')[0]!, 'Ascension')

  const pentecostMonday = new Date(easter)
  pentecostMonday.setDate(easter.getDate() + 50)
  holidays.set(pentecostMonday.toISOString().split('T')[0]!, 'Lundi de Pentecôte')

  return holidays
}
