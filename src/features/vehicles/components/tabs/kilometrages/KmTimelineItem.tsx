import { Pencil, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { VehiculeKilometrageDTO } from '@/models'
import { formatDateTime, formatNumber, formatUserName } from '../../../lib/formatters'

type KmTimelineItemProps = {
  kilometrage: VehiculeKilometrageDTO
  /** Trait vertical vers le relevé suivant (absent sur le dernier). */
  isLast: boolean
  /** Crayon d'édition (admin uniquement). */
  canEdit: boolean
  onEdit: (kilometrage: VehiculeKilometrageDTO) => void
}

/** Un relevé de la frise : pastille, « x km », date, crayon admin et auteur du relevé. */
export function KmTimelineItem({ kilometrage, isLast, canEdit, onEdit }: KmTimelineItemProps) {
  const { user } = kilometrage

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="flex flex-col items-center">
        <div className="size-3 shrink-0 rounded-full border-2 border-primary bg-background" />
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>

      <div className="-mt-0.5 flex-1 space-y-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {formatNumber(kilometrage.km)} km
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDateTime(kilometrage.createdAt)}
          </span>
          {canEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              title="Modifier ce kilométrage"
              aria-label="Modifier ce kilométrage"
              onClick={() => onEdit(kilometrage)}
            >
              <Pencil className="size-3" />
            </Button>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-2">
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={formatUserName(user)}
                className="size-5 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-5 items-center justify-center rounded-full bg-muted">
                <User className="size-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs text-muted-foreground">{formatUserName(user)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
