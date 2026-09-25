import type { ComponentProps, KeyboardEvent } from 'react'
import { Download, File, FileSpreadsheet, FileText, Trash2, ZoomIn } from 'lucide-react'
import { PdfPreview } from '@/components/shared/PdfPreview'
import type { FileData } from '@/types/file'
import { cn } from '@/lib/utils'
import { formatFileSize, getFileTypeCategory, getFileUrl } from '@/utils/fileUtils'

type FileCardProps = Omit<ComponentProps<'div'>, 'children'> & {
  file: FileData
  /** Affiche le bouton de suppression (si le fichier a un `id`). */
  deletable?: boolean
  /** Nom et taille sous l'aperçu (`true` par défaut). */
  showInfo?: boolean
  /** Clic sur une image : URL (data-URL ou URL) à ouvrir dans `ImageLightbox`. */
  onViewImage?: (url: string) => void
  /** Clic sur un PDF : à ouvrir dans `PdfViewerDialog`. */
  onViewPdf?: (file: FileData) => void
  /** Clic sur un autre fichier (Word, Excel…) : typiquement `downloadFileData(file)`. */
  onDownload?: (file: FileData) => void
  /** Suppression demandée (la page confirme avec `ConfirmDialog`). */
  onDelete?: (fileId: string) => void
}

const overlayClass =
  'absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible/preview:opacity-100'

/**
 * Carte d'un fichier de véhicule ou d'entretien (port de `FileCard.vue`) : aperçu carré (image,
 * miniature PDF en 250 px, Word, Excel ou générique), nom et taille. L'aperçu est un bouton
 * accessible au clavier ; le bouton « Supprimer » est toujours visible au tactile et au focus
 * (au survol seulement avec une souris, comme le Vue).
 *
 * @example
 * <FileCard file={file} deletable={canManage} onViewImage={openLightbox} onViewPdf={openPdf}
 *   onDownload={downloadFileData} onDelete={(id) => dialogs.open('deleteFile', id)} />
 */
export function FileCard({
  file,
  deletable = false,
  showInfo = true,
  onViewImage,
  onViewPdf,
  onDownload,
  onDelete,
  className,
  ...props
}: FileCardProps) {
  const category = getFileTypeCategory(file)
  const fileUrl = getFileUrl(file)
  const name = file.originalName || 'fichier'
  const viewable = category === 'image' || category === 'pdf'

  const handleOpen = () => {
    if (category === 'image') onViewImage?.(fileUrl)
    else if (category === 'pdf') onViewPdf?.(file)
    else onDownload?.(file)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/50 hover:shadow-md',
        className,
      )}
      {...props}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={viewable ? `Voir ${name}` : `Télécharger ${name}`}
        className="group/preview relative aspect-square cursor-pointer outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
      >
        {category === 'image' && (
          <img src={fileUrl} alt={file.originalName} className="size-full object-cover" />
        )}
        {category === 'pdf' && (
          <PdfPreview
            base64={file.fileB64 || ''}
            url={!file.fileB64 ? file.fileUrl : ''}
            width={250}
            alt={file.originalName}
          />
        )}
        {category === 'word' && (
          <div className="flex size-full items-center justify-center bg-violet-600">
            <FileText className="size-16 text-white" />
          </div>
        )}
        {category === 'excel' && (
          <div className="flex size-full items-center justify-center bg-green-600">
            <FileSpreadsheet className="size-16 text-white" />
          </div>
        )}
        {category === 'generic' && (
          <div className="flex size-full items-center justify-center bg-muted">
            <File className="size-16 text-muted-foreground" />
          </div>
        )}
        <div className={overlayClass}>
          {viewable ? (
            <ZoomIn className="size-8 text-white" />
          ) : (
            <Download className="size-8 text-white" />
          )}
        </div>
      </div>

      {showInfo && (
        <div className="space-y-1 border-t bg-card p-2">
          <p className="truncate text-xs font-medium text-foreground" title={file.originalName}>
            {file.originalName}
          </p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
        </div>
      )}

      {deletable && file.id && (
        <button
          type="button"
          title="Supprimer"
          aria-label={`Supprimer ${name}`}
          className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-destructive text-white transition-all outline-none hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/50 pointer-fine:opacity-0 pointer-fine:group-focus-within:opacity-100 pointer-fine:group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation()
            if (file.id) onDelete?.(file.id)
          }}
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  )
}
