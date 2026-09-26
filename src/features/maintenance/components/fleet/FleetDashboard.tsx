import { Car } from 'lucide-react'
import type { VehiculeDTO, VehiculeProchainEntretienDTO } from '@/models'
import { computeFleetStatus, groupFleetStatus } from '../../lib/fleetStatus'
import { EmptyBlock } from '../EmptyBlock'
import { FleetDashboardSkeleton } from './FleetDashboardSkeleton'
import { FleetStatusSection } from './FleetStatusSection'

type FleetDashboardProps = {
  isLoading: boolean
  /** Réponse de l'API des prochains entretiens de la flotte. */
  prochains: VehiculeProchainEntretienDTO[]
  /** Tout le parc : chaque véhicule a sa carte, même sans échéance. */
  vehicules: VehiculeDTO[]
}

/**
 * Onglet « Prochains entretiens » d'Entretiens.vue : véhicules en retard, à venir et à jour.
 * Comme le Vue, l'état vide dépend de la réponse de l'API des prochains entretiens, et le second
 * état vide n'apparaît que si le parc est vide alors que l'API renvoie des échéances.
 */
export function FleetDashboard({ isLoading, prochains, vehicules }: FleetDashboardProps) {
  if (isLoading) return <FleetDashboardSkeleton />

  if (prochains.length === 0) {
    return (
      <EmptyBlock icon={Car}>
        <p className="text-lg text-muted-foreground">Aucun véhicule trouvé</p>
      </EmptyBlock>
    )
  }

  const { late, upcoming, ok } = groupFleetStatus(computeFleetStatus(vehicules, prochains))

  return (
    <div className="space-y-6">
      <FleetStatusSection variant="late" items={late} />
      <FleetStatusSection variant="upcoming" items={upcoming} />
      <FleetStatusSection variant="ok" items={ok} />
      {late.length === 0 && upcoming.length === 0 && ok.length === 0 && (
        <EmptyBlock icon={Car}>
          <p className="text-lg text-muted-foreground">
            Aucun véhicule avec des entretiens configurés
          </p>
        </EmptyBlock>
      )}
    </div>
  )
}
