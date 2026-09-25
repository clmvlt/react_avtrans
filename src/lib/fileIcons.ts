import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
  type LucideIcon,
} from 'lucide-react'
import { getFileTypeCategory } from '@/utils/fileUtils'

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1) : ''
}

const PRESENTATION_EXT = ['ppt', 'pptx', 'odp']
const VIDEO_EXT = ['mp4', 'mov', 'avi', 'mkv', 'webm']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'm4a', 'flac']
const ARCHIVE_EXT = ['zip', 'rar', '7z', 'tar', 'gz']
const TEXT_EXT = ['txt', 'csv', 'md', 'odt', 'rtf']

/**
 * Icône lucide d'un fichier selon son type MIME et/ou son nom (mutualise les `getFileIcon`
 * d'Entretiens.vue et EntretiensVehicule.vue, qui utilisaient des icônes FontAwesome non
 * enregistrées, donc invisibles).
 *
 * Image → FileImage, PDF / Word / texte → FileText, Excel → FileSpreadsheet, PowerPoint →
 * Presentation, vidéo → FileVideo, audio → FileAudio, archive → FileArchive, sinon File.
 * L'extension est comparée sans tenir compte de la casse (`.DOCX` reconnu).
 *
 * Dans un rendu, utiliser le composant `FileTypeIcon` (ou `createElement(getFileIcon(…), props)`) :
 * `const Icon = getFileIcon(…)` puis `<Icon />` est refusé par la règle `react-hooks/static-components`.
 *
 * @example <FileTypeIcon mimeType={file.type} fileName={file.name} className="size-5 text-primary" />
 */
export function getFileIcon(mimeType?: string | null, fileName?: string | null): LucideIcon {
  const mime = (mimeType ?? '').toLowerCase()
  const name = (fileName ?? '').toLowerCase()
  const ext = extensionOf(name)

  switch (getFileTypeCategory({ mimeType: mime || undefined, originalName: name || undefined })) {
    case 'image':
      return FileImage
    case 'pdf':
    case 'word':
      return FileText
    case 'excel':
      return FileSpreadsheet
    case 'generic':
      break
  }

  if (ext === 'pdf') return FileText
  if (/\.(png|jpe?g|gif|webp|bmp|svg|heic)$/.test(name)) return FileImage
  if (
    mime.includes('powerpoint') ||
    mime.includes('presentation') ||
    PRESENTATION_EXT.includes(ext)
  )
    return Presentation
  if (mime.startsWith('video/') || VIDEO_EXT.includes(ext)) return FileVideo
  if (mime.startsWith('audio/') || AUDIO_EXT.includes(ext)) return FileAudio
  if (
    mime.includes('zip') ||
    mime.includes('rar') ||
    mime.includes('tar') ||
    mime.includes('compressed') ||
    ARCHIVE_EXT.includes(ext)
  )
    return FileArchive
  if (mime.startsWith('text/') || TEXT_EXT.includes(ext)) return FileText
  return File
}
