import type { ChangeEvent } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type VehiclePictureInputProps = {
  /** Aperçu (data-URL) de la photo choisie. */
  preview: string
  disabled?: boolean
  onSelect: (file: File) => void
  onClear: () => void
}

/** Photo du véhicule à la création : case « Ajouter une photo » 150×120, puis aperçu avec croix. */
export function VehiclePictureInput({
  preview,
  disabled,
  onSelect,
  onClear,
}: VehiclePictureInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onSelect(file)
  }

  if (preview) {
    return (
      <div className="relative h-[120px] w-[150px]">
        <img
          src={preview}
          alt="Prévisualisation"
          className="size-full rounded-md border object-cover"
        />
        <button
          type="button"
          aria-label="Retirer la photo"
          className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onClear}
          disabled={disabled}
        >
          <X className="size-3" />
        </button>
      </div>
    )
  }

  return (
    <label
      className={cn(
        'flex h-[120px] w-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <Camera className="size-7" />
      <span className="text-sm">Ajouter une photo</span>
    </label>
  )
}
