/**
 * Formatages des écrans de versions, repris à l'identique des quatre fichiers du Vue.
 */

/**
 * Taille d'un APK en unités anglaises (B / KB / MB), comme les quatre copies du Vue. Écart connu
 * avec `utils/fileUtils.formatFileSize` (o / Ko / Mo) : conservé pour la parité.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const isValidDate = (date: Date) => !Number.isNaN(date.getTime())

/** Date de la liste admin : « 05 sept. 2026 » ; « - » si absente ou invalide. */
export function formatShortDate(value?: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (!isValidDate(date)) return '-'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** « Créé le » du dialog de modification : « 5 sept. 2026, 14:32 » ; « - » si absente ou invalide. */
export function formatDateTime(value?: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (!isValidDate(date)) return '-'
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Date de la page publique : « 5 septembre 2026 ». Sans garde, comme le Vue : une date vide ou
 * invalide affiche « Invalid Date ».
 */
export function formatLongDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** « Aucun téléchargement », « 1 téléchargement », « 1.2k téléchargements », « 42 téléchargements ». */
export function formatDownloadCount(count: number): string {
  if (count === 0) return 'Aucun téléchargement'
  if (count === 1) return '1 téléchargement'
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k téléchargements`
  return `${count} téléchargements`
}

/** Tronque un texte et ajoute « ... » au-delà de `maxLength` caractères. */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
