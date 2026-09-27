export type ExpiryStatus = 'soon' | 'expired' | 'ok'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/**
 * État d'une échéance `YYYY-MM-DD` (assurance, contrôle technique), repris de
 * VehiculeInfoCard.vue : « bientôt » si elle tombe dans les 30 jours, « dépassée » avant
 * maintenant. Comme le Vue, la date est lue à minuit local : une échéance du jour est
 * « dépassée » dès minuit (VehiculeInfoCard.vue:558).
 */
export function getExpiryStatus(value: string | undefined): ExpiryStatus {
  if (!value) return 'ok'
  const date = new Date(value + 'T00:00:00')
  const now = new Date()
  const in30Days = new Date(now.getTime() + THIRTY_DAYS_MS)
  if (date >= now && date <= in30Days) return 'soon'
  if (date < now) return 'expired'
  return 'ok'
}

/** Couleur du texte d'une échéance : orange sous 30 jours, rouge si dépassée. */
export const EXPIRY_TEXT_CLASS: Record<ExpiryStatus, string> = {
  soon: 'text-warning',
  expired: 'text-destructive',
  ok: 'text-foreground',
}

/** État d'une échéance en toutes lettres, pour ne pas s'en remettre à la seule couleur. */
export const EXPIRY_LABEL: Record<ExpiryStatus, string | null> = {
  soon: 'Échéance dans moins de 30 jours',
  expired: 'Échéance dépassée',
  ok: null,
}
