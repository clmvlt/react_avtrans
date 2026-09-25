import type { UserContractComparisonDTO } from '@/models'

/**
 * Formatage de la page Heures contrat (fonctions locales de ContractHours.vue).
 *
 * Bug B-18 reproduit (MIGRATION.md 8.2, non autorisé à la correction) :
 * - `formatDifference` perd le signe moins (−5,5 h s'affiche « 5h30 », seule la couleur rouge
 *   distingue un écart négatif) ;
 * - l'arrondi des minutes peut donner « 7h60 » (7,999 h).
 */

export type ContractRow = UserContractComparisonDTO & { fullName: string }

/** « 7h », « 7h30 » (B-18 : « 7h60 » possible). */
export function formatContractHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return '0h'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

/** « +2h30 » ; un écart négatif s'affiche sans signe (B-18). */
export function formatDifference(diff: number | null | undefined): string {
  if (diff === null || diff === undefined) return '-'
  const sign = diff >= 0 ? '+' : ''
  return `${sign}${formatContractHours(Math.abs(diff))}`
}

export function formatPercentage(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '-'
  return `${pct.toFixed(1)}%`
}

export function getDifferenceClass(diff: number | null | undefined): string {
  if (diff === null || diff === undefined) return 'text-muted-foreground'
  if (diff >= 0) return 'text-green-600 dark:text-green-400'
  return 'text-red-600 dark:text-red-400'
}

/** ≥ 100 % vert, ≥ 80 % ambre, sinon rouge. */
export function getPercentageClass(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return 'text-muted-foreground'
  if (pct >= 100) return 'text-green-600 dark:text-green-400'
  if (pct >= 80) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

export function getProgressBarClass(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return 'bg-muted-foreground'
  if (pct >= 100) return 'bg-green-500'
  if (pct >= 80) return 'bg-amber-500'
  return 'bg-red-500'
}

/** Lignes avec le nom complet, filtrées sur le nom et l'e-mail. */
export function buildContractRows(
  comparisons: UserContractComparisonDTO[],
  search: string,
): ContractRow[] {
  const rows = comparisons.map((comparison) => ({
    ...comparison,
    fullName: `${comparison.user.firstName || ''} ${comparison.user.lastName || ''}`.trim(),
  }))
  if (!search.trim()) return rows

  const query = search.toLowerCase()
  return rows.filter(
    (row) =>
      row.fullName.toLowerCase().includes(query) ||
      (row.user.email || '').toLowerCase().includes(query),
  )
}

export type ContractTotals = {
  heuresEffectuees: number
  heuresContrat: number
  /** Jours ouvrés du mois, pris sur la première ligne. */
  joursOuvres: number | null
  usersWithContract: number
  userCount: number
}

export function computeContractTotals(comparisons: UserContractComparisonDTO[]): ContractTotals {
  return {
    heuresEffectuees: comparisons.reduce((sum, c) => sum + (c.heuresEffectuees || 0), 0),
    heuresContrat: comparisons.reduce((sum, c) => sum + (c.heureContrat || 0), 0),
    joursOuvres: comparisons.length > 0 ? (comparisons[0]?.joursOuvres ?? null) : null,
    usersWithContract: comparisons.filter((c) => c.heureContrat != null).length,
    userCount: comparisons.length,
  }
}

/** Valeur de tri d'une colonne (clés du Vue : fullName, heureContrat, difference…). */
export const getContractSortValue = (row: ContractRow, columnId: string): unknown =>
  row[columnId as keyof ContractRow]

export const MONTH_OPTIONS = [
  { value: '1', label: 'Janvier' },
  { value: '2', label: 'Février' },
  { value: '3', label: 'Mars' },
  { value: '4', label: 'Avril' },
  { value: '5', label: 'Mai' },
  { value: '6', label: 'Juin' },
  { value: '7', label: 'Juillet' },
  { value: '8', label: 'Août' },
  { value: '9', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Décembre' },
]

/** Années proposées : de l'année courante − 2 à + 1. */
export function getYearOptions(currentYear: number) {
  const years: { value: string; label: string }[] = []
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    years.push({ value: String(y), label: String(y) })
  }
  return years
}

/** Mois et année courants (valeurs initiales et « Mois actuel »). */
export function getCurrentMonthYear() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
