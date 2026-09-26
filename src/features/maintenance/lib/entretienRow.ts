import type { EntretienDTO } from '@/models'
import type { FileData } from '@/types/file'
import { downloadUrl } from '@/lib/downloadBlob'

/**
 * Entretien tel que renvoyé par l'historique : l'API y joint `files[]` (avec `fileUrl`, sans
 * base64), absent du modèle copié du Vue.
 */
export type EntretienRow = EntretienDTO & { files?: FileData[] }

/** Actions d'une ligne de l'historique (table, carte mobile, menus). */
export type EntretienRowActions = {
  onOpenFiles: (entretien: EntretienRow) => void
  onEdit: (entretien: EntretienRow) => void
  onDelete: (entretien: EntretienRow) => void
}

/** Nombre de fichiers joints (0 si l'API n'en renvoie pas). */
export const getEntretienFileCount = (entretien: EntretienRow) => entretien.files?.length ?? 0

/** « Prénom Nom » du mécanicien, vide pour un champ absent (rendu du Vue). */
export const mecanicienFullName = (entretien: EntretienRow) =>
  `${entretien.mecanicien?.firstName ?? ''} ${entretien.mecanicien?.lastName ?? ''}`

/** « Prénom N. » du mécanicien (colonne de la table). */
export const mecanicienShortName = (entretien: EntretienRow) =>
  `${entretien.mecanicien?.firstName ?? ''} ${entretien.mecanicien?.lastName?.charAt(0) ?? ''}.`

/** Kilométrage au format français, vide s'il est absent (« {{ km?.toLocaleString() }} km »). */
export const formatKm = (km?: number) => km?.toLocaleString('fr-FR') ?? ''

/** Montant au format français, sans décimales imposées (« 120,5 € HT »). */
export const formatCout = (cout: number) => `${cout.toLocaleString('fr-FR')} € HT`

/**
 * Téléchargement d'un fichier d'entretien comme le Vue : lien data-URI construit à partir du
 * base64 (rien ne se passe sans contenu base64).
 */
export function downloadEntretienFile(file: FileData) {
  if (!file.fileB64) return
  downloadUrl(`data:${file.mimeType};base64,${file.fileB64}`, file.originalName || 'fichier')
}
