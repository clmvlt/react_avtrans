/**
 * Formats de date des écrans absences et acomptes, repris à l'identique des copies locales du Vue
 * (Absences, Acomptes, MyAbsences, MyAcomptes et leurs modales). Réutilisés par la feature
 * acomptes.
 *
 * Comme le Vue, une date `YYYY-MM-DD` passe par `new Date()` (minuit UTC), ce qui donne le bon
 * jour en France (UTC+1/+2).
 */

type DateInput = string | Date | null | undefined

const toDate = (value: DateInput): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** « 25 septembre 2026 », « - » si vide. */
export function formatDateLong(value: DateInput): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** « 25 sept. 2026, 14:30 », « - » si vide. */
export function formatDateTime(value: DateInput): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** « 25 sept. » (résumés des dialogs d'annulation), « - » si vide ou invalide. */
export function formatDateCompact(value: DateInput): string {
  const date = toDate(value)
  return date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '-'
}

/** « 25 sept. » (texte d'aide des filtres), chaîne vide si vide ou invalide. */
export function formatDateShort(value: DateInput): string {
  const date = toDate(value)
  return date ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''
}

/**
 * Partie « dates » du texte d'aide des filtres : « du X au Y », « à partir du X »,
 * « jusqu'au Y », ou `null` sans date.
 */
export function dateRangeHint(startDate: string, endDate: string): string | null {
  if (startDate && endDate) return `du ${formatDateShort(startDate)} au ${formatDateShort(endDate)}`
  if (startDate) return `à partir du ${formatDateShort(startDate)}`
  if (endDate) return `jusqu'au ${formatDateShort(endDate)}`
  return null
}
