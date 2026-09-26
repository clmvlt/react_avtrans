import { FolderOpen, LoaderCircle, Trash2 } from 'lucide-react'
import { FileTypeIcon } from '@/components/shared/FileTypeIcon'
import { useDeleteEntretienFileMutation } from '../../api/useEntretienFileMutations'
import { useEntretienFilesQuery } from '../../api/useEntretienFilesQuery'
import { notifyError, notifySuccess } from '../../lib/notify'

type ExistingFilesListProps = {
  entretienId: string
}

/** Taille lisible, vide pour 0 (`formatFileSize` local d'EntretiensVehicule.vue). */
function formatSize(bytes?: number) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

/**
 * Fichiers déjà joints, dans le formulaire de modification d'EntretiensVehicule.vue.
 * Bug B-22 reproduit : la corbeille supprime le fichier **immédiatement, sans confirmation**, et
 * la suppression reste acquise même si l'on clique ensuite sur « Annuler ».
 */
export function ExistingFilesList({ entretienId }: ExistingFilesListProps) {
  const filesQuery = useEntretienFilesQuery(entretienId)
  const deleteFile = useDeleteEntretienFileMutation()
  const files = filesQuery.data ?? []
  const isLoading = filesQuery.isLoading

  const handleDelete = (fileId: string) => {
    deleteFile.mutate(
      { fileId, entretienId },
      {
        onSuccess: () => notifySuccess('Fichier supprimé'),
        onError: () => notifyError('Erreur lors de la suppression du fichier'),
      },
    )
  }

  return (
    <>
      {files.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Fichiers existants :</p>
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-2"
              >
                <div className="flex size-8 items-center justify-center text-primary">
                  <FileTypeIcon
                    mimeType={file.mimeType}
                    fileName={file.originalName}
                    className="size-5"
                  />
                </div>
                <span className="flex-1 truncate text-sm text-foreground" title={file.originalName}>
                  {file.originalName}
                </span>
                <span className="text-xs text-muted-foreground">{formatSize(file.fileSize)}</span>
                <button
                  type="button"
                  title="Supprimer"
                  aria-label={`Supprimer ${file.originalName ?? 'le fichier'}`}
                  disabled={deleteFile.isPending}
                  className="flex size-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isLoading && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            <FolderOpen className="size-4" />
            <span>Aucun fichier attaché</span>
          </div>
        )
      )}

      {isLoading && (
        <div className="mb-4 flex items-center gap-2 p-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin text-primary" />
          <span>Chargement des fichiers...</span>
        </div>
      )}
    </>
  )
}
