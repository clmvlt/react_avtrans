import { X } from 'lucide-react'
import { toast } from 'sonner'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { fileToDataUrl } from '@/lib/fileToDataUrl'

/** Taille maximale de la photo : 2 Mo */
const MAX_PICTURE_SIZE = 2097152

export type AvatarPickerValue = {
  /** Nouvelle photo choisie (data URL), `''` si aucune */
  picture: string
  /** Photo actuelle à supprimer à l'enregistrement */
  removePicture: boolean
}

type AvatarPickerProps = {
  /** Photo actuelle du profil */
  pictureUrl?: string
  value: AvatarPickerValue
  onChange: (value: AvatarPickerValue) => void
  disabled?: boolean
}

const showError = (message: string) => toast.error('Erreur', { description: message })

/**
 * Photo de profil en édition : aperçu avec bouton × (retire la nouvelle photo, sinon marque la
 * photo actuelle pour suppression), ou zone de dépôt compacte (image, 2 Mo au plus).
 */
export function AvatarPicker({ pictureUrl, value, onChange, disabled = false }: AvatarPickerProps) {
  const previewUrl = value.picture || (!value.removePicture ? pictureUrl : '')

  const handleFilesSelected = ([file]: File[]) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showError('Veuillez sélectionner une image valide')
      return
    }

    onChange({ ...value, removePicture: false })
    fileToDataUrl(file)
      .then((dataUrl) => onChange({ picture: dataUrl, removePicture: false }))
      .catch(() => showError('Erreur lors de la lecture du fichier'))
  }

  const handleRemove = () => {
    // Nouvelle photo : on la retire simplement ; sinon la photo actuelle sera supprimée
    if (value.picture) onChange({ ...value, picture: '' })
    else onChange({ ...value, removePicture: true })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Photo de profil</span>
      <div className="flex justify-center">
        {previewUrl ? (
          <div className="relative h-[120px] w-[150px]">
            <img
              src={previewUrl}
              alt="Prévisualisation"
              className="size-full rounded-md border object-cover"
            />
            <button
              type="button"
              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleRemove}
              disabled={disabled}
              aria-label="Retirer la photo"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <div className="h-[120px] w-[150px]">
            <FileDropzone
              compact
              accept="image/*"
              multiple={false}
              disabled={disabled}
              maxFileSize={MAX_PICTURE_SIZE}
              placeholderTitle="Ajouter une photo"
              placeholderSubtitle=""
              onFilesSelected={handleFilesSelected}
              onError={showError}
            />
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Formats acceptés : JPG, PNG, GIF. Taille max : 2 Mo
      </p>
    </div>
  )
}
