import { useState } from 'react'
import { Pencil, Truck, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { usePermissions } from '@/hooks/usePermissions'
import type { VehiculeDTO } from '@/models'
import { useVehicleQuery } from '../../api/useVehicleQuery'
import { getErrorMessage } from '../../lib/errors'
import { formatDate } from '../../lib/formatters'
import { INITIAL_KM_VIEW, type KmView } from '../../lib/kmView'
import { RelaiBadge } from '../RelaiBadge'
import { VehicleDetailSkeleton } from './VehicleDetailSkeleton'
import { VehicleDetailTabs } from './VehicleDetailTabs'
import { VehicleEditForm } from './VehicleEditForm'
import { VehicleInfoCard } from './VehicleInfoCard'

type VehicleDetailViewProps = {
  vehiculeId: string
}

/** « Renault Master · Créé le 12 janv. 2025 » (marque et modèle seulement si la marque existe). */
function describeVehicle(vehicule: VehiculeDTO) {
  const name = vehicule.brand ? `${vehicule.brand} ${vehicule.model ?? ''}`.trim() : ''
  return [name, `Créé le ${formatDate(vehicule.createdAt)}`].filter(Boolean).join(' · ')
}

/**
 * Détail d'un véhicule : en-tête (immatriculation, relais, marque et modèle, actions), fiche puis
 * onglets. « Modifier » remplace la fiche par le formulaire d'édition et masque les actions de
 * l'en-tête. Après chaque action, les données se rafraîchissent en arrière-plan (le Vue remettait
 * toute la page en chargement).
 */
export function VehicleDetailView({ vehiculeId }: VehicleDetailViewProps) {
  const vehicleQuery = useVehicleQuery(vehiculeId)
  const { isAdmin, isMechanic } = usePermissions()
  // Toujours vrai derrière la garde « mécanicien » (`isMecanicien` du Vue)
  const canManage = isAdmin || isMechanic
  const [isEditing, setIsEditing] = useState(false)
  // Page de l'historique km : un relevé ajouté depuis la fiche la ramène au début
  const [kmView, setKmView] = useState<KmView>(INITIAL_KM_VIEW)
  const vehicule = vehicleQuery.data

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

    if (!vehicule) {
      // Réponse sans véhicule : le Vue affichait une page blanche
      return (
        <Empty className="rounded-xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Truck />
            </EmptyMedia>
            <EmptyTitle>Véhicule introuvable</EmptyTitle>
          </EmptyHeader>
          <Button asChild variant="outline" size="sm">
            <Link to="/vehicules">Retour aux véhicules</Link>
          </Button>
        </Empty>
      )
    }

    return (
      <>
        {isEditing ? (
          <VehicleEditForm
            vehicule={vehicule}
            vehiculeId={vehiculeId}
            onDone={() => setIsEditing(false)}
          />
        ) : (
          <VehicleInfoCard
            vehicule={vehicule}
            vehiculeId={vehiculeId}
            canManage={canManage}
            onKmAdded={() => setKmView(INITIAL_KM_VIEW)}
          />
        )}
        <VehicleDetailTabs vehiculeId={vehiculeId} kmView={kmView} onKmViewChange={setKmView} />
      </>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        back={{ to: '/vehicules', label: 'Véhicules' }}
        title={
          vehicule?.immat ? (
            <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="tracking-wide uppercase">{vehicule.immat}</span>
              {vehicule.relaiImmat && (
                <RelaiBadge immat={vehicule.relaiImmat} className="text-xs" />
              )}
            </span>
          ) : (
            'Fiche véhicule'
          )
        }
        description={vehicule ? describeVehicle(vehicule) : undefined}
        actions={
          vehicule &&
          !isEditing && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/entretiens/vehicule/${vehiculeId}`}>
                  <Wrench className="size-4" />
                  Entretiens
                </Link>
              </Button>
              {canManage && (
                <Button type="button" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4" />
                  Modifier
                </Button>
              )}
            </>
          )
        }
      />
      {renderContent()}
    </PageContainer>
  )
}
