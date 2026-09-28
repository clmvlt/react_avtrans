import { useState } from 'react'
import { Gauge, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '../../lib/formatters'
import { AddKmDialog } from './AddKmDialog'
import { VehicleFactCard } from './VehicleFactCard'

type VehicleKmCardProps = {
  vehiculeId: string
  /** Dernier relevé du véhicule lui-même (hors relais, D9). */
  latestKm: number | undefined
  /** Plaque du relais en cours (D9), rappelée dans « Ajouter un relevé ». */
  relaiImmat?: string
  /** Bouton « Ajouter un relevé » (admin ou mécanicien). */
  canAdd: boolean
  onKmAdded: () => void
  className?: string
}

/**
 * Carte du dernier kilométrage, avec le bouton qui ouvre « Ajouter un kilométrage ».
 * Affiche « 0 km » quand aucun relevé n'existe, comme le Vue (VehiculeInfoCard.vue:133).
 */
export function VehicleKmCard({
  vehiculeId,
  latestKm,
  relaiImmat,
  canAdd,
  onKmAdded,
  className,
}: VehicleKmCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <VehicleFactCard
        icon={Gauge}
        label="Kilométrage"
        value={`${formatNumber(latestKm ?? 0)} km`}
        valueClassName="text-primary"
        hint={relaiImmat ? 'Dernier relevé du véhicule' : 'Dernier relevé'}
        action={
          canAdd && (
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Ajouter un relevé
            </Button>
          )
        }
        className={className}
      />
      <AddKmDialog
        open={open}
        onOpenChange={setOpen}
        vehiculeId={vehiculeId}
        relaiImmat={relaiImmat}
        onAdded={onKmAdded}
      />
    </>
  )
}
