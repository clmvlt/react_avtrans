import { Download, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FileData } from '@/types/file'
import { downloadFileData } from '@/lib/downloadBlob'
import { getFileUrl } from '@/utils/fileUtils'

type PdfViewerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Fichier affiché : son nom sert de titre, son contenu (`fileB64` ou `fileUrl`) de source. */
  file: FileData | null | undefined
  /** Source explicite (URL ou data-URL), à la place de celle calculée depuis `file`. */
  url?: string
  /** Remplace le téléchargement par défaut (`downloadFileData(file)`). */
  onDownload?: (file: FileData) => void
}

/**
 * Visionneuse PDF plein écran (reprend les overlays recopiés dans VehiculeDetail.vue et
 * EntretiensVehicule.vue) : en-tête avec le nom du fichier, « Télécharger » et fermeture, puis
 * le PDF dans une `iframe` (URL ou data-URL). Dialog Radix : Échap, clic sur le fond, focus piégé.
 *
 * @example <PdfViewerDialog open={pdf !== null} onOpenChange={(o) => !o && setPdf(null)} file={pdf} />
 */
export function PdfViewerDialog({
  open,
  onOpenChange,
  file,
  url,
  onDownload,
}: PdfViewerDialogProps) {
  const source = url ?? (file ? getFileUrl(file) : '')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[100] bg-black/90" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          onClick={(event) => {
            if (event.target === event.currentTarget) onOpenChange(false)
          }}
        >
          <div className="flex h-[90vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-lg bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b bg-muted px-4 py-3">
              <DialogTitle className="mr-4 flex-1 truncate text-sm leading-normal font-semibold">
                {file?.originalName || 'Document PDF'}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {file && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => (onDownload ? onDownload(file) : downloadFileData(file))}
                  >
                    <Download className="size-3.5" />
                    Télécharger
                  </Button>
                )}
                <DialogClose asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Fermer">
                    <X className="size-4" />
                  </Button>
                </DialogClose>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {source && (
                <iframe src={source} title="Visualiseur PDF" className="size-full border-none" />
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}
