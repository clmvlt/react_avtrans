import type { ComponentProps } from 'react'
import { FileText, LoaderCircle } from 'lucide-react'
import { usePdfPreview } from '@/hooks/usePdfPreview'
import { cn } from '@/lib/utils'

type PdfPreviewProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Contenu du PDF en base64 (avec ou sans préfixe `data:`). */
  base64?: string | null
  /** URL du PDF, prioritaire sur `base64`. */
  url?: string | null
  /** Largeur d'affichage **et** de rendu, en px (200 par défaut). */
  width?: number
  alt?: string
}

/**
 * Miniature de la première page d'un PDF (port de `PdfPreview.vue`) : spinner pendant le rendu,
 * image, ou repli « PDF » en cas d'échec. La largeur demandée est bien utilisée pour le rendu
 * (le Vue rendait toujours en 200 px). Largeur fixe en px et hauteur minimale de 200 px, comme le Vue.
 *
 * @example <PdfPreview base64={file.fileB64} width={250} alt={file.originalName} />
 */
export function PdfPreview({
  base64,
  url,
  width = 200,
  alt = 'Prévisualisation PDF',
  className,
  style,
  ...props
}: PdfPreviewProps) {
  const { data: previewUrl, isLoading } = usePdfPreview({ base64, url, width })

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20',
        className,
      )}
      style={{ width: `${width}px`, minHeight: '200px', ...style }}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-red-600 dark:text-red-400" />
        </div>
      ) : previewUrl ? (
        <img src={previewUrl} alt={alt} className="size-full object-cover object-top" />
      ) : (
        <div className="flex flex-col items-center gap-2 p-4">
          <FileText className="size-12 text-red-600 dark:text-red-400" />
          <span className="text-xs font-bold tracking-wide text-red-600 uppercase dark:text-red-400">
            PDF
          </span>
        </div>
      )}
    </div>
  )
}
