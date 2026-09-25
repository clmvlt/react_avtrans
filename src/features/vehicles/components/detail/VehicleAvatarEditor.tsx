import type { ChangeEvent } from 'react'
import { Camera, Truck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type VehicleAvatarEditorProps = {
  /** Photo actuelle du véhicule. */
  pictureUrl?: string
  alt?: string
  /** Nouvelle photo choisie (data-URL). */
  preview: string | null
  /** « Supprimer la photo » cliqué : la photo actuelle n'est plus affichée. */
  removed: boolean
  onSelect: (file: File) => void
  onRemove: () => void
}

/**
 * Photo du véhicule en édition : clic pour en choisir une autre, croix pour la retirer.
 * L'overlay caméra n'apparaît qu'au survol à la souris ; au tactile il reste visible, et il
 * s'affiche au focus clavier (le Vue ne le montrait qu'au survol).
 */
export function VehicleAvatarEditor({
  pictureUrl,
  alt,
  preview,
  removed,
  onSelect,
  onRemove,
}: VehicleAvatarEditorProps) {
  const imageUrl = preview || (pictureUrl && !removed ? pictureUrl : '')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onSelect(file)
    // Permet de choisir à nouveau le même fichier
    event.target.value = ''
  }

  return (
    <div className="relative shrink-0">
      <div className="group relative size-[72px]">
        {imageUrl ? (
          <img src={imageUrl} alt={alt} className="size-full rounded-lg object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center rounded-lg bg-primary text-white">
            <Truck className="size-8" />
          </div>
        )}

        <label
          title="Changer la photo"
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/50 transition-opacity has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:has-[:focus-visible]:opacity-100"
        >
          <Camera className="size-6 text-white" />
          <span className="sr-only">Changer la photo</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        </label>

        {imageUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute -top-2 -right-2"
            title="Supprimer la photo"
            aria-label="Supprimer la photo"
            onClick={onRemove}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
    </div>
  )
}
