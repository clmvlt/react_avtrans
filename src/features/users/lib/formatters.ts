/**
 * Formatage des dates de la page Utilisateurs (repris tels quels de Users.vue et UserEditModal.vue).
 */

const DAY_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}

/** Date du dernier véhicule : « Aujourd'hui », « Hier », sinon JJ/MM/AAAA. */
export function formatVehicleDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === now.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', DAY_FORMAT)
}

/** Date de création d'un compte en attente (JJ/MM/AAAA), vide si absente ou invalide. */
export function formatCreatedAt(createdAt?: Date | string): string {
  if (!createdAt) return ''
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', DAY_FORMAT)
}

/** Date et heure des « Informations système » (« 12 sept. 2026, 14:30 »), « - » si absente. */
export function formatSystemDate(value?: Date | string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
