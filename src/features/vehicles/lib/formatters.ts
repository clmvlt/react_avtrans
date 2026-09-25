/**
 * Formats d'affichage des écrans véhicules, repris à l'identique des helpers recopiés dans
 * Vehicules.vue, VehiculeDetail.vue et les composants de `components/vehicles`.
 */

/** « 125 000 » ; `undefined` donne « 0 » (badge km sans relevé, relevé sans valeur). */
export function formatNumber(value: number | undefined): string {
  if (value === undefined) return '0'
  return new Intl.NumberFormat('fr-FR').format(value)
}

/** « 12 janv. 2025 » (liste, « Créé le »), « - » sans valeur. */
export function formatDate(value: string | Date | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** « 12 janv. 2025, 14:20 » (relevés, commentaires, rapports, photos), « - » sans valeur. */
export function formatDateTime(value: string | Date | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Date métier `YYYY-MM-DD` (mise en circulation, échéances) : « 12 janv. 2025 ».
 * Comme le Vue, `T00:00:00` est ajouté pour lire la date en heure locale ; une date-heure
 * renvoyée par l'API donnerait « Invalid Date » (VehiculeInfoCard.vue:551).
 */
export function formatDateShort(value: string | undefined): string {
  if (!value) return '-'
  return new Date(value + 'T00:00:00').toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const pad2 = (value: number) => String(value).padStart(2, '0')

/** Valeur `YYYY-MM-DDTHH:mm` d'un `<input type="datetime-local">`, en heure locale. */
export function toDatetimeLocal(value: string | Date | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

/** Prénom et nom d'un utilisateur séparés par une espace, comme les templates du Vue. */
export function formatUserName(user: { firstName?: string | null; lastName?: string | null }) {
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`
}
