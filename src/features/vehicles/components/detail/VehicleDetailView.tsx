import { useState } from 'react'
import { Truck } from 'lucide-react'
import { Link } from 'react-router'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useVehicleQuery } from '../../api/useVehicleQuery'
import { getErrorMessage } from '../../lib/errors'
import { INITIAL_KM_VIEW, type KmView } from '../../lib/kmView'
import { VehicleDetailSkeleton } from './VehicleDetailSkeleton'
import { VehicleDetailTabs } from './VehicleDetailTabs'
import { VehicleInfoCard } from './VehicleInfoCard'

type VehicleDetailViewProps = {
  vehiculeId: string
}

/**
 * Détail d'un véhicule : fiche puis onglets. Après chaque action, les données se rafraîchissent en
 * arrière-plan (le Vue remettait toute la page en chargement).
 */
export function VehicleDetailView({ vehiculeId }: VehicleDetailViewProps) {
  const vehicleQuery = useVehicleQuery(vehiculeId)
  // Page de l'historique km : un relevé ajouté depuis la fiche la ramène au début
  const [kmView, setKmView] = useState<KmView>(INITIAL_KM_VIEW)

  const renderContent = () => {
    if (vehicleQuery.isPending) return <VehicleDetailSkeleton />

    if (vehicleQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(vehicleQuery.error, 'Erreur lors du chargement du véhicule')}
          onRetry={() => void vehicleQuery.refetch()}
          isRetrying={vehicleQuery.isRefetching}
        />
      )
    }

    const vehicule = vehicleQuery.data
    if (!vehicule) {
      // Réponse sans véhicule : le Vue affichait une page blanche
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Truck />
            </EmptyMedia>
            <EmptyTitle>Véhicule introuvable</EmptyTitle>
          </EmptyHeader>
          <Button asChild variant="outline" size="sm">
            <Link to="/vehicules">Véhicules</Link>
          </Button>
        </Empty>
      )
    }

    return (
      <div className="space-y-6">
        <VehicleInfoCard
          vehicule={vehicule}
          vehiculeId={vehiculeId}
          onKmAdded={() => setKmView(INITIAL_KM_VIEW)}
        />
        <VehicleDetailTabs vehiculeId={vehiculeId} kmView={kmView} onKmViewChange={setKmView} />
      </div>
    )
  }

  return (
    <main className="px-6 py-6">
      <div className="mx-auto max-w-[1400px]">{renderContent()}</div>
    </main>
  )
}
