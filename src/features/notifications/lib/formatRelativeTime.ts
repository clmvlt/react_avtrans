type FormatRelativeTimeOptions = {
  /**
   * `short` : popover de la navbar (« Il y a 3j », puis « 12 sept. ») ;
   * `long` : page /notifications (« Il y a 3 jours », puis « 12 septembre », avec l'année si elle
   * diffère de l'année en cours). Les deux formats du Vue.
   */
  style?: 'short' | 'long'
  /** Instant de référence en ms (par défaut maintenant ; `useNow()` pour un affichage vivant) */
  now?: number
}

/** Ancienneté d'une notification : « À l'instant », « Il y a 5 min », « Il y a 2h », « Hier »… */
export function formatRelativeTime(
  value: Date | string | null | undefined,
  { style = 'short', now = Date.now() }: FormatRelativeTimeOptions = {},
): string {
  if (!value) return ''

  const date = new Date(value)
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return 'Hier'
  if (days < 7) return style === 'long' ? `Il y a ${days} jours` : `Il y a ${days}j`

  if (style === 'long') {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== new Date(now).getFullYear() ? 'numeric' : undefined,
    })
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
