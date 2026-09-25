/**
 * Image d'une signature : l'API renvoie le base64 tel qu'il a été enregistré, avec ou sans
 * préfixe `data:image/…`. Chaîne vide si absent.
 */
export function formatSignatureBase64(base64String?: string): string {
  if (!base64String) return ''
  if (base64String.startsWith('data:image')) return base64String
  return `data:image/png;base64,${base64String}`
}

/** « 25 sept. 2026, 14:03 » (ou « - »), comme `formatDateTime` de Signatures.vue. */
export function formatSignatureDateTime(dateValue?: string | Date): string {
  if (!dateValue) return '-'
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Heures décimales du rappel de signature : « 151h 40m », ou « 151h » sans minutes.
 * Arrondi repris du Vue (7,999 h donne « 7h 60m »).
 */
export function formatHoursMinutes(hours: number): string {
  const total = Math.max(0, hours || 0)
  const h = Math.floor(total)
  const m = Math.round((total - h) * 60)
  return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${h}h`
}
