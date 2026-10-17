import { addDaysToKey, parseLocalDateKey, toLocalDateKey } from '@/lib/dates'

/** Mois affiché (`month` de 1 à 12). */
export type YearMonth = { year: number; month: number }

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

/** Durée d'une journée « pleine » pour la jauge d'une case du calendrier. */
const FULL_DAY_SECONDS = 8 * 3600

export function currentYearMonth(now = new Date()): YearMonth {
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export const isSameMonth = (a: YearMonth, b: YearMonth) => a.year === b.year && a.month === b.month

/** Clé `YYYY-MM` d'un mois (comparée au `monthKey` des jours du planning). */
export const monthKey = ({ year, month }: YearMonth) => `${year}-${String(month).padStart(2, '0')}`

/** « Octobre 2026 » */
export function formatMonthTitle({ year, month }: YearMonth): string {
  const label = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/**
 * Jours affichés par la grille d'un mois : du lundi de la semaine du 1er au dimanche de la semaine
 * du dernier jour (clés locales `YYYY-MM-DD`, 4 à 6 semaines).
 */
export function monthGridRange({ year, month }: YearMonth): { startDate: string; endDate: string } {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const startOffset = (first.getDay() + 6) % 7
  const endOffset = 6 - ((last.getDay() + 6) % 7)
  return {
    startDate: addDaysToKey(toLocalDateKey(first), -startOffset),
    endDate: addDaysToKey(toLocalDateKey(last), endOffset),
  }
}

/** Découpe une suite de jours en semaines de 7. */
export function chunkWeeks<T>(days: T[]): T[][] {
  const weeks: T[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

/** Remplissage de la jauge d'une journée (0 à 1), 8 h = jauge pleine. */
export const dayFillRatio = (seconds: number) =>
  Math.min(1, Math.max(0, seconds / FULL_DAY_SECONDS))

/** « vendredi 16 octobre » (titre accessible d'une case). */
export function formatDayLabel(dateKey: string): string {
  return (
    parseLocalDateKey(dateKey)?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }) ?? dateKey
  )
}
