import { Car, ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { UserLastVehicleDTO } from '@/models'
import { formatVehicleDate } from '../lib/formatters'

type LastVehicleInfoProps = {
  vehicle: UserLastVehicleDTO | undefined
  /** `table` : immatriculation et date l'une sous l'autre ; `card` : bandeau des cartes mobiles. */
  variant?: 'table' | 'card'
}

/** Dernier véhicule utilisé, avec un lien vers sa fiche. */
export function LastVehicleInfo({ vehicle, variant = 'table' }: LastVehicleInfoProps) {
  if (!vehicle) {
    return variant === 'table' ? (
      <span className="text-xs text-muted-foreground italic">—</span>
    ) : null
  }

  const link = (
    <Button asChild variant="ghost" size="icon" className="ml-auto size-7">
      <Link to={`/vehicules/${vehicle.vehiculeId}`} title="Voir le véhicule">
        <ExternalLink className="size-3.5" />
      </Link>
    </Button>
  )

  if (variant === 'card') {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
        <Car className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-sm font-medium">{vehicle.vehiculeImmat}</span>
        <span className="text-xs text-muted-foreground">· {formatVehicleDate(vehicle.date)}</span>
        {link}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Car className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{vehicle.vehiculeImmat}</span>
        <span className="text-xs text-muted-foreground">{formatVehicleDate(vehicle.date)}</span>
      </div>
      {link}
    </div>
  )
}
