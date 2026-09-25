import { useState, type KeyboardEvent, type Ref } from 'react'
import { ChevronLeft, ChevronRight, Download, RotateCcw, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Button } from '@/components/ui/button'
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog'
import { useSwipe } from '@/hooks/useSwipe'
import { useZoom } from '@/hooks/useZoom'
import { downloadBlob } from '@/lib/downloadBlob'
import { cn } from '@/lib/utils'

type ImageLightboxProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Image seule (si `images` est vide). */
  src?: string
  /** Galerie : liste d'URL (ou data-URL). */
  images?: string[]
  /** Image affichée à l'ouverture dans la galerie. */
  initialIndex?: number
  alt?: string
}

const controlClass =
  'bg-black/50 text-white hover:bg-black/70 hover:text-white dark:hover:bg-black/70'

/**
 * Visionneuse d'images plein écran (port d'`ImageLightbox.vue`) : zoom 0,5 à 5 (boutons et
 * molette), galerie avec flèches, ← / → au clavier, balayage horizontal pour naviguer et vers le
 * bas pour fermer, téléchargement. Échap ou clic sur le fond ferment.
 *
 * Construite sur un Dialog Radix de niveau supérieur (z-[200]) : ouverte depuis un autre Dialog,
 * c'est elle qui reçoit Échap, le focus et les clics, sans fermer le Dialog en dessous
 * (le Vue interceptait Échap en phase de capture pour obtenir ce résultat).
 *
 * @example
 * <ImageLightbox open={lightbox.open} onOpenChange={setOpen} images={urls} initialIndex={index} />
 */
export function ImageLightbox({
  open,
  onOpenChange,
  src = '',
  images = [],
  initialIndex = 0,
  alt = '',
}: ImageLightboxProps) {
  const allImages = images.length > 0 ? images : src ? [src] : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[200] bg-black/95 duration-300" />
        {/* Monté à chaque ouverture : index et zoom repartent de l'image demandée. */}
        <LightboxContent
          images={allImages}
          initialIndex={initialIndex}
          alt={alt}
          onClose={() => onOpenChange(false)}
        />
      </DialogPortal>
    </Dialog>
  )
}

type LightboxContentProps = {
  /** Transmise par Radix (Presence) pour suivre l'animation de sortie. */
  ref?: Ref<HTMLDivElement>
  images: string[]
  initialIndex: number
  alt: string
  onClose: () => void
}

function LightboxContent({ ref, images, initialIndex, alt, onClose }: LightboxContentProps) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)),
  )
  const { zoom, zoomIn, zoomOut, resetZoom, onWheel } = useZoom()
  const count = images.length
  const currentSrc = images[index] ?? ''

  const goTo = (next: number) => {
    if (next < 0 || next >= count) return
    setIndex(next)
    resetZoom()
  }
  const prev = () => goTo(index - 1)
  const next = () => goTo(index + 1)

  const swipe = useSwipe({
    disabled: zoom !== 1,
    onSwipeLeft: next,
    onSwipeRight: prev,
    onSwipeDown: onClose,
  })

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.stopPropagation()
      prev()
    } else if (event.key === 'ArrowRight') {
      event.stopPropagation()
      next()
    }
  }

  const download = async () => {
    if (!currentSrc) return
    try {
      const response = await fetch(currentSrc)
      const blob = await response.blob()
      const ext = blob.type.split('/')[1] || 'jpg'
      downloadBlob(blob, `photo-${index + 1}.${ext}`)
    } catch {
      window.open(currentSrc, '_blank')
    }
  }

  const transform = [
    `scale(${zoom})`,
    swipe.isSwiping ? `translateX(${swipe.delta.x}px) translateY(${swipe.delta.y}px)` : '',
  ].join(' ')

  return (
    <DialogPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className="fixed inset-0 z-[200] flex items-center justify-center outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:duration-300 data-[state=open]:fade-in-0"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      onKeyDown={handleKeyDown}
    >
      <DialogTitle className="sr-only">{alt || "Visionneuse d'images"}</DialogTitle>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {count > 1 && (
          <div className="flex items-center rounded-full bg-black/50 px-3 py-1.5 text-sm font-medium text-white">
            {index + 1} / {count}
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={controlClass}
          title="Télécharger"
          aria-label="Télécharger"
          onClick={() => void download()}
        >
          <Download className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={controlClass}
          title="Zoom arrière"
          aria-label="Zoom arrière"
          onClick={zoomOut}
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={controlClass}
          title="Zoom avant"
          aria-label="Zoom avant"
          onClick={zoomIn}
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={controlClass}
          title="Réinitialiser le zoom"
          aria-label="Réinitialiser le zoom"
          onClick={resetZoom}
        >
          <RotateCcw className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={controlClass}
          title="Fermer"
          aria-label="Fermer"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      {count > 1 && index > 0 && (
        <button
          type="button"
          aria-label="Image précédente"
          className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          onClick={prev}
        >
          <ChevronLeft className="size-6" />
        </button>
      )}
      {count > 1 && index < count - 1 && (
        <button
          type="button"
          aria-label="Image suivante"
          className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          onClick={next}
        >
          <ChevronRight className="size-6" />
        </button>
      )}

      <div
        className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onWheel={onWheel}
        {...swipe.handlers}
      >
        <img
          src={currentSrc}
          alt={alt}
          draggable={false}
          className={cn(
            'max-h-[90vh] max-w-full object-contain select-none',
            !swipe.isSwiping && 'transition-transform duration-200',
          )}
          style={{ transform }}
        />
      </div>
    </DialogPrimitive.Content>
  )
}
