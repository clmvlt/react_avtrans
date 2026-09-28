import type { UserContractComparisonDTO } from '@/models'

/**
 * Formatage de la page Heures contrat (fonctions locales de ContractHours.vue).
 *
 * Bug B-18 corrigé avec l'accord du propriétaire (D8, MIGRATION.md 8.2) : un écart négatif garde
 * son signe moins et les minutes sont arrondies sans produire « 7h60 ».
 *
 * D8 : les heures créditées (absences approuvées + jours fériés chômés) s'ajoutent aux heures
 * effectuées ; l'écart et la réalisation portent sur ce total. Si l'API ne renvoie pas encore ces
 * champs, on retombe sur les heures effectuées seules.
 *
 * D10 : prévision de fin de mois calculée par l'API (total actuel + jours ouvrés restants au
 * rythme du contrat), affichée pour le mois en cours et les mois à venir.
 */

export type ContractRow = UserContractComparisonDTO & {
  fullName: string
  /** Absences + fériés. */
  heuresCreditees: number
  /** Effectuées + créditées. */
  heuresTotal: number
  /** Total − contrat (null sans contrat). */
  differenceTotal: number | null
  /** Total / contrat en % (null sans contrat). */
  pourcentageTotal: number | null
}

/** « 7h », « 7h30 ». */
export function formatContractHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return '0h'
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes - h * 60
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

/** « +2h30 », « −5h30 », « 0h ». */
export function formatDifference(diff: number | null | undefined): string {
  if (diff === null || diff === undefined) return '-'
  if (Math.round(Math.abs(diff) * 60) === 0) return '0h'
  const sign = diff > 0 ? '+' : '−'
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
/** « 3 », « 9,5 » (jours ouvrés restants, demi-journées comprises). */
export function formatJours(jours: number | null | undefined): string {
  return (jours ?? 0).toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

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

const round2 = (value: number) => Math.round(value * 100) / 100

/** Heures créditées d'une comparaison (absences + fériés). */
export const getHeuresCreditees = (comparison: UserContractComparisonDTO) =>
  round2((comparison.heuresAbsences ?? 0) + (comparison.heuresFeries ?? 0))

/** Lignes avec le nom complet et les totaux D8, filtrées sur le nom et l'e-mail. */
export function buildContractRows(
  comparisons: UserContractComparisonDTO[],
  search: string,
): ContractRow[] {
  const rows = comparisons.map((comparison) => ({
    ...comparison,
    fullName: `${comparison.user.firstName || ''} ${comparison.user.lastName || ''}`.trim(),
    heuresCreditees: getHeuresCreditees(comparison),
    heuresTotal: comparison.heuresTotal ?? comparison.heuresEffectuees,
    differenceTotal:
      comparison.differenceTotal !== undefined ? comparison.differenceTotal : comparison.difference,
    pourcentageTotal:
      comparison.pourcentageTotal !== undefined
        ? comparison.pourcentageTotal
        : comparison.pourcentageRealisation,
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
  /** Absences + fériés de tous les employés. */
  heuresCreditees: number
  heuresContrat: number
  /** Jours ouvrés du mois, pris sur la première ligne. */
  joursOuvres: number | null
  usersWithContract: number
  userCount: number
}

export function computeContractTotals(comparisons: UserContractComparisonDTO[]): ContractTotals {
  return {
    heuresEffectuees: comparisons.reduce((sum, c) => sum + (c.heuresEffectuees || 0), 0),
    heuresCreditees: comparisons.reduce((sum, c) => sum + getHeuresCreditees(c), 0),
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

type MonthYear = { month: number; year: number }

/**
 * Prévision de fin de mois (D10) à afficher : mois en cours ou à venir (un mois passé n'a plus de
 * jour restant, la prévision y vaut le total), et API qui la calcule.
 */
export function shouldShowForecast(
  period: MonthYear,
  current: MonthYear,
  comparisons: UserContractComparisonDTO[],
): boolean {
  const isPast = period.year * 12 + period.month < current.year * 12 + current.month
  return !isPast && comparisons.some((c) => c.joursOuvresRestants !== undefined)
}

/** Mois et année courants (valeurs initiales et « Mois actuel »). */
export function getCurrentMonthYear() {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}
