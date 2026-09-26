import type { ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { FileTypeIcon } from '@/components/shared/FileTypeIcon'
import { cn } from '@/lib/utils'
import { ENTRETIEN_FILE_ACCEPT, readPendingFiles, type PendingFile } from '../../lib/pendingFiles'

type PendingFilesInputProps = {
  id?: string
  files: PendingFile[]
  onFilesChange: (updater: (files: PendingFile[]) => PendingFile[]) => void
  /**
   * - `list` (Entretiens.vue) : lignes avec vignette, nom et bouton de retrait ;
   * - `grid` (EntretiensVehicule.vue) : vignettes de 100 px avec pastille de retrait.
   */
  layout: 'list' | 'grid'
}

/**
 * Champ natif de fichiers multiples des formulaires d'entretien et aperçu des fichiers en
 * attente d'envoi. Comme le Vue, chaque sélection s'ajoute aux précédentes, les fichiers sont
 * lus en base64 dès le choix et l'input n'est pas réinitialisé.
 */
export function PendingFilesInput({ id, files, onFilesChange, layout }: PendingFilesInputProps) {
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    const read = await readPendingFiles(selected)
    if (read.length > 0) onFilesChange((current) => [...current, ...read])
  }

  const remove = (index: number) =>
    onFilesChange((current) => current.filter((_, i) => i !== index))

  const thumbnail = (pending: PendingFile, iconClassName: string) =>
    pending.file.type.startsWith('image/') ? (
      <img src={pending.preview} alt="Preview" className="size-full object-cover" />
    ) : (
      <FileTypeIcon
        mimeType={pending.file.type}
        fileName={pending.file.name}
        className={cn('text-primary', iconClassName)}
      />
    )

  return (
    <>
      <input
        id={id}
        type="file"
        accept={ENTRETIEN_FILE_ACCEPT}
        multiple
        onChange={(event) => void handleChange(event)}
        className={
          layout === 'list'
            ? 'w-full cursor-pointer rounded-md border-2 border-dashed border-input bg-muted/50 px-3 py-2 text-sm'
            : 'block w-full cursor-pointer rounded-md border-2 border-dashed border-border bg-muted/50 p-3 text-sm text-foreground'
        }
      />

      {files.length > 0 && layout === 'list' && (
        <div className="mt-2 flex flex-col gap-2">
          {files.map((pending, index) => (
            <div
              key={`${pending.file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-2"
            >
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted">
                {thumbnail(pending, 'size-5')}
              </div>
              <span className="flex-1 truncate text-sm text-foreground">{pending.file.name}</span>
              <button
                type="button"
                aria-label={`Retirer ${pending.file.name}`}
                className="flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() => remove(index)}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && layout === 'grid' && (
        <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3">
          {files.map((pending, index) => (
            <div
              key={`${pending.file.name}-${index}`}
              className="relative flex flex-col items-center gap-2 rounded-md border bg-muted/50 p-2"
            >
              <div className="flex size-10 items-center justify-center overflow-hidden rounded-sm bg-muted">
                {thumbnail(pending, 'size-6')}
              </div>
              <span className="w-full truncate text-center text-xs text-foreground">
                {pending.file.name}
              </span>
              <button
                type="button"
                aria-label={`Retirer ${pending.file.name}`}
                className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-destructive"
                onClick={() => remove(index)}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
