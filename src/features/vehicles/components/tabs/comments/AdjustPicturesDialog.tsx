import { ErrorState } from '@/components/shared/ErrorState'
import { useAdjustInfoPicturesQuery } from '../../../api/useAdjustInfoPicturesQuery'
import { getErrorMessage } from '../../../lib/errors'
import { PicturesGridDialog } from '../../PicturesGridDialog'

type AdjustPicturesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Commentaire dont on affiche les photos (chargées à l'ouverture). */
  adjustInfoId: string | null
}

/** « Photos de l'ajustement » : photos d'un commentaire, chargées à l'ouverture du dialog. */
export function AdjustPicturesDialog({
  open,
  onOpenChange,
  adjustInfoId,
}: AdjustPicturesDialogProps) {
  // L'identifiant reste connu pendant l'animation de fermeture : la grille ne se vide pas
  const picturesQuery = useAdjustInfoPicturesQuery(adjustInfoId)

  return (
    <PicturesGridDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Photos de l'ajustement"
      description="Galerie de photos de l'ajustement"
      pictures={picturesQuery.data ?? []}
      pictureAlt="Photo de l'ajustement"
      emptyText="Aucune photo pour cet ajustement"
      isLoading={picturesQuery.isPending}
      error={
        picturesQuery.isError && (
          <ErrorState
            message={getErrorMessage(picturesQuery.error, 'Erreur lors du chargement des photos')}
            onRetry={() => void picturesQuery.refetch()}
            isRetrying={picturesQuery.isRefetching}
          />
        )
      }
    />
  )
}
