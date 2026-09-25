import { createElement } from 'react'
import type { LucideProps } from 'lucide-react'
import { getFileIcon } from '@/lib/fileIcons'

type FileTypeIconProps = LucideProps & {
  /** Type MIME du fichier (`file.type`, `mimeType`). */
  mimeType?: string | null
  /** Nom du fichier, utilisé si le type MIME est absent ou générique. */
  fileName?: string | null
}

/**
 * Icône lucide du type d'un fichier (image, PDF, Word, Excel, PowerPoint, vidéo, audio,
 * archive…), d'après `getFileIcon`. Remplace les `font-awesome-icon :icon="getFileIcon(...)"`
 * d'Entretiens et EntretiensVehicule, qui n'affichaient rien (icônes non enregistrées).
 *
 * @example <FileTypeIcon mimeType={file.type} fileName={file.name} className="size-5 text-primary" />
 */
export function FileTypeIcon({ mimeType, fileName, ...props }: FileTypeIconProps) {
  return createElement(getFileIcon(mimeType, fileName), { 'aria-hidden': true, ...props })
}
