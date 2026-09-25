import { Truck } from 'lucide-react'
import { Empty } from '@/components/ui/empty'
import type { VehiculeDTO } from '@/models'
import { VehicleMobileCard } from './VehicleMobileCard'

type VehiclesMobileListProps = {
  vehicules: VehiculeDTO[]
  canDelete: boolean
  onDetails: (vehicule: VehiculeDTO) => void
  onEntretiens: (vehicule: VehiculeDTO) => void
  onDelete: (vehicule: VehiculeDTO) => void
}

/** Liste en cartes sous md (pas de contrôle de tri ni de pagination, comme le Vue). */
export function VehiclesMobileList({ vehicules, ...actions }: VehiclesMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{vehicules.length} véhicule(s)</p>

      {vehicules.length === 0 && (
        <Empty className="gap-3 p-0 py-12 text-muted-foreground md:p-0 md:py-12">
          <Truck className="size-10 opacity-50" />
          <p>Aucun véhicule trouvé</p>
        </Empty>
      )}

      {vehicules.map((vehicule, index) => (
        <VehicleMobileCard key={vehicule.id ?? index} vehicule={vehicule} {...actions} />
      ))}
    </div>
  )
}
