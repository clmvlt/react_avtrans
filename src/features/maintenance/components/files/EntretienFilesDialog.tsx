import { useState } from 'react'
import { FolderOpen, LoaderCircle } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FileCard } from '@/components/shared/FileCard'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { ImageLightbox } from '@/components/shared/ImageLightbox'
import { PdfViewerDialog } from '@/components/shared/PdfViewerDialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FileData } from '@/types/file'
import { cn } from '@/lib/utils'
import { fileToBase64 } from '@/lib/fileToDataUrl'
import { getFileUrl, isImage } from '@/utils/fileUtils'
import {
  useAddEntretienFileMutation,
  useDeleteEntretienFileMutation,
} from '../../api/useEntretienFileMutations'
import { useEntretienFilesQuery } from '../../api/useEntretienFilesQuery'
import { downloadEntretienFile, type EntretienRow } from '../../lib/entretienRow'
import { notifyError, notifySuccess } from '../../lib/notify'
import { ENTRETIEN_FILE_ACCEPT } from '../../lib/pendingFiles'
import { IrreversibleNotice } from '../IrreversibleNotice'

type EntretienFilesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entretien: EntretienRow | null
  /** Ajout (dropzone) et suppression des fichiers. */
  canManage: boolean
  /**
   * - `fleet` (Entretiens.vue) : titre avec l'immatriculation ; un clic sur un PDF ne fait rien
   *   (le Vue n'écoute pas `view-pdf`) ;
   * - `vehicule` (EntretiensVehicule.vue) : titre avec le type, description, visionneuse PDF,
   *   bouton « Fermer » ; l'historique est rechargé après une suppression.
   */
  variant: 'fleet' | 'vehicule'
}

type LightboxState = { open: boolean; images: string[]; index: number }

/** Dialog des fichiers d'un entretien : grille de fichiers, ajout d'un fichier, suppression. */
export function EntretienFilesDialog({
  open,
  onOpenChange,
  entretien,
  canManage,
  variant,
}: EntretienFilesDialogProps) {
  const isVehicule = variant === 'vehicule'
  const entretienId = entretien?.id
  const filesQuery = useEntretienFilesQuery(entretienId, { enabled: open })
  const addFile = useAddEntretienFileMutation()
  const deleteFile = useDeleteEntretienFileMutation()

  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, images: [], index: 0 })
  const [pdf, setPdf] = useState<{ open: boolean; file: FileData | null }>({
    open: false,
    file: null,
  })

  const files = filesQuery.data ?? []

  const openImage = (url: string) => {
    const images = files.filter((f) => isImage(f)).map((f) => getFileUrl(f))
    const index = images.indexOf(url)
    setLightbox(
      images.length > 0
        ? { open: true, images, index: index >= 0 ? index : 0 }
        : { open: true, images: [url], index: 0 },
    )
  }

  const handleAddFile = async (file: File | undefined) => {
    if (!file || !entretienId) return
    try {
      const base64 = await fileToBase64(file)
      if (!base64) return
      await addFile.mutateAsync({
        entretienId,
        file: { fileB64: base64, originalName: file.name, mimeType: file.type },
      })
      notifySuccess('Fichier ajouté avec succès')
    } catch {
      notifyError("Erreur lors de l'ajout du fichier")
    }
  }

  const handleConfirmDelete = () => {
    if (!fileToDelete || !entretienId) return
    deleteFile.mutate(
      { fileId: fileToDelete, entretienId, refreshHistory: isVehicule },
      {
        onSuccess: () => {
          notifySuccess('Fichier supprimé avec succès')
          setFileToDelete(null)
        },
        onError: () => notifyError('Erreur lors de la suppression du fichier'),
      },
    )
  }

  const title = isVehicule
    ? `Fichiers - ${entretien?.typeEntretien?.nom || ''}`
    : `Fichiers - ${entretien?.vehiculeImmat || 'Véhicule'}`

  const renderFiles = () => {
    if (filesQuery.isLoading) {
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4',
            isVehicule ? 'py-10' : 'py-8',
          )}
        >
          <LoaderCircle className="size-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Chargement des fichiers...</p>
        </div>
      )
    }
    if (files.length === 0) {
      return isVehicule ? (
        <div className="flex flex-col items-center justify-center gap-4 py-10 text-muted-foreground">
          <FolderOpen className="size-16 opacity-50" />
          <p>Aucun fichier attaché</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <FolderOpen className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">Aucun fichier attaché</p>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            deletable={canManage}
            onViewImage={openImage}
            onViewPdf={isVehicule ? (pdfFile) => setPdf({ open: true, file: pdfFile }) : undefined}
            onDownload={downloadEntretienFile}
            onDelete={setFileToDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"
          {...(isVehicule ? {} : { 'aria-describedby': undefined })}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {isVehicule && (
              <DialogDescription>Fichiers attachés à cet entretien.</DialogDescription>
            )}
          </DialogHeader>

          {renderFiles()}

          {canManage && (
            <div className="border-t pt-4">
              <FileDropzone
                compact
                accept={ENTRETIEN_FILE_ACCEPT}
                multiple={false}
                disabled={addFile.isPending}
                placeholderTitle="Ajouter un fichier"
                placeholderSubtitle="glissez ou cliquez"
                onFilesSelected={([file]) => void handleAddFile(file)}
              />
            </div>
          )}

          {isVehicule && (
            <DialogFooter className="flex items-center justify-end sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={fileToDelete !== null}
        onOpenChange={(next) => {
          if (!next) setFileToDelete(null)
        }}
        title="Supprimer le fichier"
        description="Cette action est irréversible."
        icon={null}
        isPending={deleteFile.isPending}
        onConfirm={handleConfirmDelete}
      >
        <IrreversibleNotice
          variant={isVehicule ? 'centered' : 'inline'}
          message={
            isVehicule
              ? 'Êtes-vous sûr de vouloir supprimer ce fichier ?'
              : 'Voulez-vous vraiment supprimer ce fichier ?'
          }
        />
      </ConfirmDialog>

      <ImageLightbox
        open={lightbox.open}
        onOpenChange={(next) => setLightbox((current) => ({ ...current, open: next }))}
        images={lightbox.images}
        initialIndex={lightbox.index}
      />

      {isVehicule && (
        <PdfViewerDialog
          open={pdf.open}
          onOpenChange={(next) => setPdf((current) => ({ ...current, open: next }))}
          file={pdf.file}
          url={pdf.file?.fileB64 ? `data:application/pdf;base64,${pdf.file.fileB64}` : ''}
          onDownload={downloadEntretienFile}
        />
      )}
    </>
  )
}
