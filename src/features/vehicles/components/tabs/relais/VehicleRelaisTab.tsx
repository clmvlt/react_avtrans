import { Plus, Repeat } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useVehicleRelaisQuery } from '../../../api/useVehicleRelaisQuery'
import type { RelaiActions } from '../../../hooks/useRelaiDialogs'
import { getErrorMessage } from '../../../lib/errors'
import { TabContentSkeleton } from '../TabContentSkeleton'
import { RelaiHistoryItem } from './RelaiHistoryItem'

type VehicleRelaisTabProps = {
  vehiculeId: string
  /** Déclaration, modification et suppression (admin ou mécanicien). */
  canManage: boolean
  actions: RelaiActions
}

/** Onglet « Relais » (D9) : historique des véhicules relais, du plus récent au plus ancien. */
export function VehicleRelaisTab({ vehiculeId, canManage, actions }: VehicleRelaisTabProps) {
  const relaisQuery = useVehicleRelaisQuery(vehiculeId)

  const renderContent = () => {
    if (relaisQuery.isPending) {
      return <TabContentSkeleton variant="cards" label="Chargement des relais..." />
    }

    if (relaisQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(relaisQuery.error, 'Erreur lors du chargement des relais')}
          onRetry={() => void relaisQuery.refetch()}
          isRetrying={relaisQuery.isRefetching}
        />
      )
    }

    const relais = relaisQuery.data

    if (relais.length === 0) {
      return (
        <Empty className="gap-4 p-0 py-12 md:p-0 md:py-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Repeat className="size-8" />
          </div>
          <div className="max-w-sm text-center">
            <p className="font-medium text-foreground">Aucun relais</p>
            <p className="text-sm text-muted-foreground">
              Quand le véhicule part au garage, déclarez le véhicule qui le remplace : ses
              kilométrages seront suivis à part.
            </p>
          </div>
        </Empty>
      )
    }

    return (
      <ul className="space-y-3">
        {relais.map((relai) => (
          <RelaiHistoryItem key={relai.id} relai={relai} canManage={canManage} actions={actions} />
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          Historique des relais
          {relaisQuery.data && relaisQuery.data.length > 0 && ` (${relaisQuery.data.length})`}
        </h3>
        {canManage && (
          <Button type="button" variant="outline" size="sm" onClick={() => actions.declare()}>
            <Plus className="size-4" />
            Déclarer un relais
          </Button>
        )}
      </div>
      {renderContent()}
    </div>
  )
}
