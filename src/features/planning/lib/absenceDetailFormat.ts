/** Formatage du dialog « Détails de l'absence » du planning (fonctions locales de Planning.vue). */

export type AbsenceStatusVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export function getAbsenceStatusVariant(status?: string): AbsenceStatusVariant {
  switch (status) {
    case 'APPROVED':
      return 'default'
    case 'PENDING':
      return 'secondary'
    case 'REJECTED':
      return 'destructive'
    case 'CANCELLED':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function getAbsenceStatusText(status?: string): string {
  switch (status) {
    case 'PENDING':
      return 'En attente'
    case 'APPROVED':
      return 'Approuvée'
    case 'REJECTED':
      return 'Refusée'
    case 'CANCELLED':
      return 'Annulée'
    default:
      return 'Inconnu'
  }
}

/** « 12 septembre 2026 ». */
export function formatAbsenceDate(value?: string | Date): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** « 12 sept. 2026, 14:30 ». */
export function formatAbsenceDateTime(value?: string | Date): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Durée en jours calendaires, bornes incluses (demi-journées ignorées, comme le Vue). */
export function calculateAbsenceDuration(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return '-'
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays} jour${diffDays > 1 ? 's' : ''}`
}
