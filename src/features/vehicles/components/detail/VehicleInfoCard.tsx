import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { VehiculeDTO } from '@/models'
import { RelaiBadge } from '../RelaiBadge'
import { VehicleAvatar } from '../VehicleAvatar'
import { VehicleDetailsGrid } from './VehicleDetailsGrid'
import { VehicleEditForm } from './VehicleEditForm'
import { VehicleInfoHeader } from './VehicleInfoHeader'
import { VehicleKmBadge } from './VehicleKmBadge'

type VehicleInfoCardProps = {
  vehicule: VehiculeDTO
  vehiculeId: string
  /** Relevé ajouté depuis la pastille km. */
  onKmAdded: () => void
}

/** Fiche du véhicule (VehiculeInfoCard.vue) : affichage, ou formulaire d'édition en place. */
export function VehicleInfoCard({ vehicule, vehiculeId, onKmAdded }: VehicleInfoCardProps) {
  const { isAdmin, isMechanic } = usePermissions()
  // Toujours vrai derrière la garde « mécanicien » (`isMecanicien` du Vue)
  const canManage = isAdmin || isMechanic
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {isEditing ? (
        <VehicleEditForm
          vehicule={vehicule}
          vehiculeId={vehiculeId}
          onDone={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="p-5">
            <VehicleInfoHeader
              vehicule={vehicule}
              vehiculeId={vehiculeId}
              isEditing={false}
              canEdit={canManage}
              onEdit={() => setIsEditing(true)}
            />

            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <VehicleAvatar
                  pictureUrl={vehicule.pictureUrl}
                  alt={vehicule.immat}
                  className="size-[72px] rounded-lg"
                  iconClassName="size-8"
                />
              </div>

              <div className="flex min-w-0 flex-col justify-center gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-wide text-foreground uppercase">
                    {vehicule.immat}
                  </h2>
                  {vehicule.relaiImmat && (
                    <RelaiBadge immat={vehicule.relaiImmat} className="text-xs" />
                  )}
                </div>
                {vehicule.brand && (
                  <p className="text-sm text-muted-foreground">
                    {vehicule.brand} {vehicule.model}
                  </p>
                )}
              </div>

              <VehicleKmBadge
                vehiculeId={vehiculeId}
                latestKm={vehicule.latestKm}
                canAdd={canManage}
                onKmAdded={onKmAdded}
              />
            </div>
          </div>

          <VehicleDetailsGrid vehicule={vehicule} />
        </>
      )}
    </div>
  )
}
