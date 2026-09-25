import { AbsencePeriod, AbsencePeriodLabels } from '@/enums/AbsencePeriod'

/**
 * Get the French label for an absence period
 * @param period - The absence period value
 * @returns French label, defaults to "Journée entière"
 */
export function getPeriodLabel(period?: string): string {
  if (!period || !(period in AbsencePeriodLabels)) {
    return AbsencePeriodLabels[AbsencePeriod.FULL_DAY]
  }
  return AbsencePeriodLabels[period as AbsencePeriod]
}

/**
 * Check if the period is a half-day (morning or afternoon)
 * @param period - The absence period value
 * @returns true if MORNING or AFTERNOON
 */
export function isHalfDay(period?: string): boolean {
  return period === AbsencePeriod.MORNING || period === AbsencePeriod.AFTERNOON
}

/**
 * Calculate human-readable absence duration
 * @param startDate - Start date string
 * @param endDate - End date string
 * @param period - Optional absence period
 * @returns Formatted duration string
 */
export function calculateAbsenceDuration(startDate?: string | Date, endDate?: string | Date, period?: string): string {
  if (!startDate || !endDate) return '-'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  if (isHalfDay(period)) {
    if (diffDays === 1) {
      return '½ journée'
    }
    return `${diffDays} jour${diffDays > 1 ? 's' : ''} · ${getPeriodLabel(period)}`
  }

  return `${diffDays} jour${diffDays > 1 ? 's' : ''}`
}

/**
 * Libellé français d'un statut d'absence
 */
export function getAbsenceStatusLabel(status?: string): string {
  switch (status) {
    case 'PENDING': return 'En attente'
    case 'APPROVED': return 'Approuvée'
    case 'REJECTED': return 'Refusée'
    case 'CANCELLED': return 'Annulée'
    default: return 'Inconnu'
  }
}

/**
 * Classes Tailwind (bordure, fond, texte) d'une pastille de statut d'absence
 */
export function getAbsenceStatusClasses(status?: string): string {
  switch (status) {
    case 'PENDING': return 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400'
    case 'APPROVED': return 'border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
    case 'REJECTED': return 'border-destructive/40 bg-destructive/10 text-destructive'
    case 'CANCELLED': return 'border-border bg-muted text-muted-foreground'
    default: return 'border-border bg-muted text-muted-foreground'
  }
}
