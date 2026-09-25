import type { FileData } from '@/types/file'
import { getFileUrl } from '@/utils/fileUtils'

/**
 * Déclenche le téléchargement d'une URL (data-URL, blob: ou URL du même domaine) via un lien
 * `<a download>` temporaire. Pour une URL d'un autre domaine, le navigateur ignore `download`
 * et ouvre le fichier (limite connue, MIGRATION.md 8.3).
 */
export function downloadUrl(url: string, filename: string): void {
  if (!url) return
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/** Télécharge un Blob sous le nom donné (URL objet révoquée une fois le téléchargement lancé). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  downloadUrl(url, filename)
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Télécharge un fichier de véhicule ou d'entretien (`fileB64` ou `fileUrl`) sous son nom d'origine,
 * « fichier » par défaut. Mutualise les `downloadFile` de VehiculeDetail, Entretiens et
 * EntretiensVehicule.
 */
export function downloadFileData(file: FileData): void {
  downloadUrl(getFileUrl(file), file.originalName || 'fichier')
}
