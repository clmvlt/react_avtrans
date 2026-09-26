import type { EntretienFileUploadRequest } from '@/services'
import { fileToDataUrl } from '@/lib/fileToDataUrl'

/** Fichier choisi dans un formulaire d'entretien, pas encore envoyé. */
export type PendingFile = {
  file: File
  /** data-URL complète (aperçu des images). */
  preview: string
  /** Contenu base64 brut envoyé à l'API. */
  base64: string
}

/** Types acceptés par les champs de fichiers des entretiens. */
export const ENTRETIEN_FILE_ACCEPT = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx'

/**
 * Lit les fichiers choisis (comme les `FileReader` du Vue) : un fichier illisible ou vide est
 * ignoré, sans message.
 */
export async function readPendingFiles(files: File[]): Promise<PendingFile[]> {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      const preview = await fileToDataUrl(file)
      return { file, preview, base64: preview.split(',')[1] ?? '' }
    }),
  )
  return results.flatMap((result) =>
    result.status === 'fulfilled' && result.value.base64 ? [result.value] : [],
  )
}

export const toUploadRequest = ({ file, base64 }: PendingFile): EntretienFileUploadRequest => ({
  fileB64: base64,
  originalName: file.name,
  mimeType: file.type,
})
