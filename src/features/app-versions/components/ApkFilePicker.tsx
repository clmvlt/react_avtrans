import { File as FileIcon, X } from 'lucide-react'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '../lib/format'

type ApkFilePickerProps = {
  /** Fichier retenu (affiché dès le choix, pendant sa lecture) */
  file: File | null
  disabled?: boolean
  isReading?: boolean
  progress?: number
  onFilesSelected: (files: File[]) => void
  onError: (message: string) => void
  onRemove: () => void
}

/** Choix de l'APK : zone de dépôt, puis carte du fichier retenu avec un bouton pour le retirer. */
export function ApkFilePicker({
  file,
  disabled = false,
  isReading = false,
  progress = 0,
  onFilesSelected,
  onError,
  onRemove,
}: ApkFilePickerProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">
        Fichier APK <span className="text-destructive">*</span>
      </span>
      {file ? (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
          <FileIcon className="size-5 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={disabled || isReading}
            aria-label="Retirer le fichier"
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <FileDropzone
          accept=".apk"
          multiple={false}
          disabled={disabled || isReading}
          uploading={isReading}
          progress={progress}
          uploadCurrentFile="Lecture du fichier..."
          placeholderTitle="Glissez-déposez votre fichier APK ici"
          placeholderSubtitle="ou cliquez pour parcourir"
          hint="Fichiers .apk uniquement"
          onFilesSelected={onFilesSelected}
          onError={onError}
        />
      )}
    </div>
  )
}
