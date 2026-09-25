import {
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  type Ref,
} from 'react'
import { CloudUpload } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

/** Méthodes exposées par `ref` (ex. bouton « Ajouter » ailleurs dans la page). */
export type FileDropzoneHandle = {
  /** Ouvre le sélecteur de fichiers du système. */
  open: () => void
}

type FileDropzoneProps = Omit<ComponentProps<'div'>, 'ref' | 'onError'> & {
  ref?: Ref<FileDropzoneHandle>
  /** Types acceptés par le sélecteur (`'image/*,.pdf,.doc,.docx,.xls,.xlsx'` par défaut). */
  accept?: string
  /** Plusieurs fichiers (`true` par défaut) ; sinon seul le premier fichier déposé est transmis. */
  multiple?: boolean
  disabled?: boolean
  /** Envoi en cours : affiche la progression à la place de l'invite et bloque les ajouts. */
  uploading?: boolean
  /** Progression de l'envoi, de 0 à 100. */
  progress?: number
  /** Nom du fichier en cours d'envoi. */
  uploadCurrentFile?: string
  /** Nombre de fichiers à envoyer (affiche « index/total » si > 0). */
  uploadTotalFiles?: number
  uploadCurrentIndex?: number
  placeholderTitle?: string
  placeholderSubtitle?: string
  /** Aide sous l'invite (masquée en mode compact). */
  hint?: string
  /** Taille maximale d'un fichier en octets ; au-delà, `onError` est appelé et rien n'est transmis. */
  maxFileSize?: number
  /** Version sur une ligne (ajout d'un fichier dans un dialog). */
  compact?: boolean
  /** Fichiers choisis (copie : l'input est vidé juste après). */
  onFilesSelected: (files: File[]) => void
  onError?: (message: string) => void
}

/**
 * Zone de dépôt de fichiers (port de `FileDropzone.vue`) : glisser-déposer ou clic, et désormais
 * Entrée / Espace au clavier. Transmet un `File[]` ; barre de progression pendant l'envoi.
 *
 * @example
 * <FileDropzone compact multiple={false} accept="image/*,application/pdf"
 *   placeholderTitle="Ajouter un fichier" placeholderSubtitle="glissez ou cliquez"
 *   onFilesSelected={([file]) => file && upload(file)} onError={(m) => toast.error(m)} />
 */
export function FileDropzone({
  ref,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  multiple = true,
  disabled = false,
  uploading = false,
  progress = 0,
  uploadCurrentFile = '',
  uploadTotalFiles = 0,
  uploadCurrentIndex = 0,
  placeholderTitle = 'Glissez-déposez vos fichiers ici',
  placeholderSubtitle = 'ou cliquez pour parcourir',
  hint = '',
  maxFileSize,
  compact = false,
  onFilesSelected,
  onError,
  className,
  ...props
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const blocked = disabled || uploading

  const openPicker = () => {
    if (!blocked) inputRef.current?.click()
  }

  useImperativeHandle(ref, () => ({ open: () => inputRef.current?.click() }), [])

  const emitFiles = (list: FileList | null | undefined) => {
    if (!list || list.length === 0) return
    const files = multiple ? Array.from(list) : Array.from(list).slice(0, 1)
    if (maxFileSize) {
      const tooBig = files.find((file) => file.size > maxFileSize)
      if (tooBig) {
        onError?.(`Le fichier "${tooBig.name}" dépasse la taille maximale autorisée`)
        return
      }
    }
    onFilesSelected(files)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!blocked) setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    // Ignore les passages d'un enfant à l'autre (le Vue clignotait).
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (!blocked) emitFiles(event.dataTransfer.files)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    emitFiles(event.target.files)
    event.target.value = ''
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPicker()
    }
  }

  return (
    <div
      role="button"
      tabIndex={blocked ? -1 : 0}
      aria-disabled={blocked || undefined}
      aria-label={`${placeholderTitle}, ${placeholderSubtitle}`}
      className={cn(
        'cursor-pointer rounded-lg border-2 border-dashed transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        isDragging && 'border-primary bg-primary/5',
        !isDragging && !uploading && 'border-border hover:border-primary/50',
        uploading && 'cursor-default',
        disabled && 'pointer-events-none opacity-50',
        compact ? 'p-4' : 'p-0',
        className,
      )}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        tabIndex={-1}
        onChange={handleInputChange}
        onClick={(event) => event.stopPropagation()}
      />

      {uploading ? (
        <div className={compact ? 'space-y-2' : 'space-y-3 p-8'}>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CloudUpload className="size-5 text-primary" />
              Envoi en cours...
            </span>
            {uploadTotalFiles > 0 && (
              <span className="text-sm text-muted-foreground">
                {uploadCurrentIndex}/{uploadTotalFiles}
              </span>
            )}
          </div>
          <Progress value={progress} className="bg-muted" aria-label="Progression de l'envoi" />
          {uploadCurrentFile && (
            <p className="truncate text-xs text-muted-foreground">{uploadCurrentFile}</p>
          )}
        </div>
      ) : (
        <div
          className={
            compact
              ? 'flex items-center gap-3 text-center'
              : 'flex flex-col items-center gap-3 p-8 text-center'
          }
        >
          {compact ? (
            <CloudUpload className="size-5 shrink-0 text-primary" />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CloudUpload className="size-8" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              <strong>{placeholderTitle}</strong>
            </p>
            <p className="text-sm text-muted-foreground">{placeholderSubtitle}</p>
          </div>
          {hint && !compact && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      )}
    </div>
  )
}
