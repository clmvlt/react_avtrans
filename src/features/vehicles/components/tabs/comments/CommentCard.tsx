import { CalendarDays, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VehiculeAdjustInfoDTO } from '@/models'
import { formatDateTime } from '../../../lib/formatters'
import { UserChip } from '../../UserChip'

type CommentCardProps = {
  adjustInfo: VehiculeAdjustInfoDTO
  onViewPictures: (adjustInfoId: string) => void
}

/**
 * Commentaire d'un véhicule : auteur, date, texte, puis « Voir les photos ». Comme le Vue, les
 * retours à la ligne saisis ne sont pas rendus et le bouton apparaît même sans photo (l'API ne
 * fournit pas leur nombre).
 */
export function CommentCard({ adjustInfo, onViewPictures }: CommentCardProps) {
  const { id } = adjustInfo

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        {adjustInfo.user && <UserChip user={adjustInfo.user} />}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" />
          {formatDateTime(adjustInfo.createdAt)}
        </div>
      </div>

      <p className="text-sm text-foreground">{adjustInfo.comment}</p>

      {id && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => onViewPictures(id)}>
            <Images className="size-4" />
            Voir les photos
          </Button>
        </div>
      )}
    </div>
  )
}
