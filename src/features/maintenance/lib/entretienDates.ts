/**
 * Dates des formulaires d'entretien. Les deux vues Vue ne calculent pas les dates de la même
 * façon ; chaque écart est reproduit tel quel (bugs B-01 et B-21 non autorisés).
 */

const pad2 = (value: number) => String(value).padStart(2, '0')

/** Date longue française (« 12 mars 2025 »), `fallback` si la valeur est absente. */
export function formatLongDate(value?: Date | string, fallback = ''): string {
  if (!value) return fallback
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Entretiens.vue (édition) : date locale de la valeur de l'API, au format `YYYY-MM-DD`. */
export function toLocalDateInput(value?: Date | string): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** EntretiensVehicule.vue (édition) : partie date de la chaîne ISO renvoyée par l'API. */
export function toIsoDatePart(value?: Date | string): string {
  const text = typeof value === 'string' ? value : (value?.toISOString() ?? '')
  return text.split('T')[0] ?? ''
}

/** Entretiens.vue et « Valider » : midi sans fuseau, interprété en Europe/Paris par l'API. */
export const toNoonDateTime = (dateKey: string) => `${dateKey}T12:00:00`

/**
 * Bug B-21 reproduit (EntretiensVehicule.vue:1546) : minuit UTC de la date saisie, suivi d'un
 * décalage `+01:00` codé en dur (faux l'été). Lève une RangeError sur une date vide, comme le Vue.
 */
export const toFixedOffsetDateTime = (dateKey: string) =>
  new Date(dateKey).toISOString().replace('Z', '+01:00')
