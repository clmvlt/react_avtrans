import type { ReactNode } from 'react'
import { Images } from 'lucide-react'
import { ImageLightbox } from '@/components/shared/ImageLightbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '../lib/formatters'
import { useLightbox } from '../hooks/useLightbox'

type Picture = {
  id?: string
  pictureUrl?: string
  createdAt?: string | Date
}

type PicturesGridDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Description lue par les lecteurs d'écran uniquement. */
  description: string
  pictures: Picture[]
  /** Texte alternatif de chaque photo. */
  pictureAlt: string
  emptyText: string
  isLoading?: boolean
  /** Contenu affiché à la place de la grille en cas d'erreur de chargement. */
  error?: ReactNode
}

/**
 * Galerie des photos d'un commentaire ou d'un rapport (VehiculeDetail.vue:231 et 351) : grille
 * carrée avec la date, clic = visionneuse plein écran. Comme le Vue, l'image ouverte correspond à
 * l'index dans la liste complète alors que la galerie ignore les photos sans URL
 * (VehiculeDetail.vue:259-263).
 */
export function PicturesGridDialog({
  open,
  onOpenChange,
  title,
  description,
  pictures,
  pictureAlt,
  emptyText,
  isLoading = false,
  error,
}: PicturesGridDialogProps) {
  const lightbox = useLightbox()
  const galleryUrls = pictures.flatMap((picture) =>
    picture.pictureUrl ? [picture.pictureUrl] : [],
  )

  const renderBody = () => {
    if (isLoading) {
      return (
        <div
          className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          aria-busy="true"
          aria-label="Chargement des photos..."
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      )
    }

    if (error) return error

    if (pictures.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Images className="size-8" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {pictures.map((picture, index) => (
          <div key={picture.id ?? index} className="space-y-2">
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <button
                type="button"
                className="block size-full cursor-pointer"
                aria-label={`${pictureAlt} en plein écran`}
                onClick={() => lightbox.show(picture.pictureUrl ?? '', galleryUrls, index)}
              >
                <img
                  src={picture.pictureUrl || undefined}
                  alt={pictureAlt}
                  className="size-full object-cover transition-transform hover:scale-105"
                />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{formatDateTime(picture.createdAt)}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Images className="size-5" />
              </div>
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">{description}</DialogDescription>
          </DialogHeader>
          {renderBody()}
        </DialogContent>
      </Dialog>

      <ImageLightbox
        open={lightbox.open}
        onOpenChange={lightbox.onOpenChange}
        images={lightbox.images}
        initialIndex={lightbox.index}
        alt="Image plein écran"
      />
    </>
  )
}
