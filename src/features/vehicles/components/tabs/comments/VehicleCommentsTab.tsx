import { useState } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useVehicleAdjustInfosQuery } from '../../../api/useVehicleAdjustInfosQuery'
import { getErrorMessage } from '../../../lib/errors'
import { TabContentSkeleton } from '../TabContentSkeleton'
import { AddCommentDialog } from './AddCommentDialog'
import { AdjustPicturesDialog } from './AdjustPicturesDialog'
import { CommentCard } from './CommentCard'

type VehicleCommentsTabProps = {
  vehiculeId: string
  /** Page affichée, conservée d'un onglet à l'autre comme dans le Vue. */
  page: number
  onPageChange: (page: number) => void
}

/** Onglet « Commentaires » (VehiculeCommentsTab.vue) : ajout ouvert à tous, sans édition ni suppression. */
export function VehicleCommentsTab({ vehiculeId, page, onPageChange }: VehicleCommentsTabProps) {
  const commentsQuery = useVehicleAdjustInfosQuery(vehiculeId, page)
  const [addOpen, setAddOpen] = useState(false)
  const [pictures, setPictures] = useState<{ open: boolean; adjustInfoId: string | null }>({
    open: false,
    adjustInfoId: null,
  })

  const renderContent = () => {
    if (commentsQuery.isPending) {
      return <TabContentSkeleton variant="cards" label="Chargement des commentaires..." />
    }

    if (commentsQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(
            commentsQuery.error,
            'Erreur lors du chargement des commentaires',
          )}
          onRetry={() => void commentsQuery.refetch()}
          isRetrying={commentsQuery.isRefetching}
        />
      )
    }

    const { adjustInfos } = commentsQuery.data

    if (adjustInfos.length === 0) {
      return (
        <Empty className="gap-4 p-0 py-16 text-muted-foreground md:p-0 md:py-16">
          <MessageSquare className="size-12 opacity-50" />
          <p>Aucun commentaire enregistré</p>
        </Empty>
      )
    }

    return (
      <div className="space-y-3">
        {adjustInfos.map((adjustInfo, index) => (
          <CommentCard
            key={adjustInfo.id ?? index}
            adjustInfo={adjustInfo}
            onViewPictures={(adjustInfoId) => setPictures({ open: true, adjustInfoId })}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">Commentaires</h3>
        <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Ajouter un commentaire
        </Button>
      </div>

      {renderContent()}

      <SimplePagination
        variant="compact"
        page={commentsQuery.data?.page ?? page}
        totalPages={commentsQuery.data?.totalPages ?? 0}
        disabled={commentsQuery.isPlaceholderData}
        onPageChange={onPageChange}
      />

      <AddCommentDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        vehiculeId={vehiculeId}
        onAdded={() => onPageChange(0)}
      />
      <AdjustPicturesDialog
        open={pictures.open}
        onOpenChange={(open) => setPictures((current) => ({ ...current, open }))}
        adjustInfoId={pictures.adjustInfoId}
      />
    </div>
  )
}
