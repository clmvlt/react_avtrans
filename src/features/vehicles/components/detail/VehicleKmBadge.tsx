import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '../../lib/formatters'
import { AddKmDialog } from './AddKmDialog'

type VehicleKmBadgeProps = {
  vehiculeId: string
  latestKm: number | undefined
  /** Crayon d'ajout d'un relevé (admin ou mécanicien). */
  canAdd: boolean
  onKmAdded: () => void
}

/**
 * Pastille du dernier kilométrage, avec le crayon qui ouvre « Ajouter un kilométrage ».
 * Affiche « 0 » quand aucun relevé n'existe, comme le Vue (VehiculeInfoCard.vue:133).
 */
export function VehicleKmBadge({ vehiculeId, latestKm, canAdd, onKmAdded }: VehicleKmBadgeProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex size-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-muted/60">
      <span className="text-[11px] leading-none font-medium text-muted-foreground uppercase">
        Kilomètre
      </span>
      <span className="text-xl leading-none font-bold text-primary">
        {formatNumber(latestKm ?? 0)}
      </span>
      <span className="text-[11px] leading-none font-medium text-muted-foreground uppercase">
        km
      </span>
      {canAdd && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute -top-1.5 -right-1.5 size-6 rounded-full bg-card shadow-sm"
          title="Ajouter un kilométrage"
          aria-label="Ajouter un kilométrage"
          onClick={() => setOpen(true)}
        >
          <Pencil className="size-3" />
        </Button>
      )}
      <AddKmDialog open={open} onOpenChange={setOpen} vehiculeId={vehiculeId} onAdded={onKmAdded} />
    </div>
  )
}
