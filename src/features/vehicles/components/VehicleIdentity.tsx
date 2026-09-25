import { Link } from 'react-router'
import type { VehiculeDTO } from '@/models'
import { cn } from '@/lib/utils'
import { RelaiBadge } from './RelaiBadge'
import { VehicleAvatar } from './VehicleAvatar'

type VehicleIdentityProps = {
  vehicule: VehiculeDTO
  /** Classes de la vignette (`size-11` dans la table, `size-12` en mobile). */
  avatarClassName?: string
  className?: string
}

/** Vignette, immatriculation, badge relais, marque et modèle ; lien vers le détail. */
export function VehicleIdentity({ vehicule, avatarClassName, className }: VehicleIdentityProps) {
  return (
    <Link
      to={`/vehicules/${vehicule.id}`}
      className={cn('flex cursor-pointer items-center gap-3', className)}
    >
      <VehicleAvatar
        pictureUrl={vehicule.pictureUrl}
        alt={vehicule.immat}
        className={avatarClassName}
      />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide text-foreground uppercase">
            {vehicule.immat}
          </span>
          {vehicule.relaiImmat && <RelaiBadge immat={vehicule.relaiImmat} />}
        </div>
        <span className="text-sm text-muted-foreground">
          {vehicule.brand} {vehicule.model}
        </span>
      </div>
    </Link>
  )
}
