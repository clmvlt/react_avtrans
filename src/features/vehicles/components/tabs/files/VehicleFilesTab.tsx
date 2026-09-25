import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { toast } from 'sonner'
import { ErrorState } from '@/components/shared/ErrorState'
import { FileCard } from '@/components/shared/FileCard'
import { FileDropzone } from '@/components/shared/FileDropzone'
import { ImageLightbox } from '@/components/shared/ImageLightbox'
import { PdfViewerDialog } from '@/components/shared/PdfViewerDialog'
import { Empty } from '@/components/ui/empty'
import { downloadFileData } from '@/lib/downloadBlob'
import type { FileData } from '@/types/file'
import { getFileUrl, isImage } from '@/utils/fileUtils'
import { useDeleteVehicleFileMutation } from '../../../api/useDeleteVehicleFileMutation'
import { useVehicleFilesQuery } from '../../../api/useVehicleFilesQuery'
import type { VehicleFilesUpload } from '../../../hooks/useVehicleFilesUpload'
import { useLightbox } from '../../../hooks/useLightbox'
import { getErrorMessage } from '../../../lib/errors'
import { FormErrorBanner } from '../../FormErrorBanner'
import { TabContentSkeleton } from '../TabContentSkeleton'

/** Types acceptés par la zone de dépôt (VehiculeFilesTab.vue). */
const ACCEPTED_TYPES =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

type VehicleFilesTabProps = {
  vehiculeId: string
  canManage: boolean
  /** Envoi en cours, monté au niveau des onglets pour survivre à un changement d'onglet. */
  upload: VehicleFilesUpload
}

/**
 * Onglet « Fichiers » : dépôt (admin ou mécanicien), puis grille de fichiers. Clic sur une image =
 * galerie de toutes les images, sur un PDF = visionneuse, sinon téléchargement. La suppression
 * part sans confirmation, comme le Vue (bug B-22 reproduit).
 */
export function VehicleFilesTab({ vehiculeId, canManage, upload }: VehicleFilesTabProps) {
  const filesQuery = useVehicleFilesQuery(vehiculeId)
  const deleteFile = useDeleteVehicleFileMutation(vehiculeId)
  const lightbox = useLightbox()
  const [pdfViewer, setPdfViewer] = useState<{ open: boolean; file: FileData | null }>({
    open: false,
    file: null,
  })
  const files = filesQuery.data ?? []

  const openImage = (url: string) => {
    const imageUrls = files.filter((file) => isImage(file)).map((file) => getFileUrl(file))
    const index = imageUrls.indexOf(url)
    lightbox.show(url, imageUrls, index >= 0 ? index : 0)
  }

  const handleDelete = (fileId: string) => {
    if (deleteFile.isPending) return
    deleteFile.mutate(fileId, {
      onError: (error) =>
        toast.error(getErrorMessage(error, 'Erreur lors de la suppression du fichier')),
    })
  }

  const renderFiles = () => {
    if (filesQuery.isPending) {
      return <TabContentSkeleton variant="files" label="Chargement des fichiers..." />
    }

    if (filesQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(filesQuery.error, 'Erreur lors du chargement des fichiers')}
          onRetry={() => void filesQuery.refetch()}
          isRetrying={filesQuery.isRefetching}
        />
      )
    }

    if (files.length === 0) {
      return canManage ? (
        <Empty className="p-0 py-4 md:p-0 md:py-4">
          <p className="text-sm text-muted-foreground">Aucun fichier pour le moment</p>
        </Empty>
      ) : (
        <Empty className="gap-4 p-0 py-16 text-muted-foreground md:p-0 md:py-16">
          <FolderOpen className="size-12 opacity-50" />
          <p>Aucun fichier disponible</p>
        </Empty>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {files.map((file, index) => (
          <FileCard
            key={file.id ?? index}
            file={file}
            deletable={canManage}
            onViewImage={openImage}
            onViewPdf={(pdf) => setPdfViewer({ open: true, file: pdf })}
            onDownload={downloadFileData}
            onDelete={handleDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {upload.error && <FormErrorBanner className="p-4 text-base">{upload.error}</FormErrorBanner>}

      {canManage && (
        <FileDropzone
          accept={ACCEPTED_TYPES}
          uploading={upload.uploading}
          progress={upload.progress}
          uploadCurrentFile={upload.currentFile}
          uploadTotalFiles={upload.totalFiles}
          uploadCurrentIndex={upload.currentIndex}
          disabled={upload.uploading}
          placeholderTitle="Glissez-déposez vos fichiers ici"
          placeholderSubtitle="ou cliquez pour parcourir"
          hint="Images, PDF, Word, Excel jusqu'à 500MB"
          onFilesSelected={upload.upload}
        />
      )}

      {renderFiles()}

      <ImageLightbox
        open={lightbox.open}
        onOpenChange={lightbox.onOpenChange}
        images={lightbox.images}
        initialIndex={lightbox.index}
        alt="Image plein écran"
      />
      <PdfViewerDialog
        open={pdfViewer.open}
        onOpenChange={(open) => setPdfViewer((current) => ({ ...current, open }))}
        file={pdfViewer.file}
      />
    </div>
  )
}
