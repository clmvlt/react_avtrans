import { Plus, Wrench } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useDialogState } from '@/hooks/useDialogState'
import type { VehiculeEquipementDTO } from '@/models'
import { useVehicleEquipementsQuery } from '../../../api/useVehicleEquipementsQuery'
import { getErrorMessage } from '../../../lib/errors'
import { TabContentSkeleton } from '../TabContentSkeleton'
import { EquipementCard } from './EquipementCard'
import { EquipementDeleteDialog } from './EquipementDeleteDialog'
import { EquipementFormDialog } from './EquipementFormDialog'

type VehicleEquipementsTabProps = {
  vehiculeId: string
  /** Ajout, modification et suppression (admin ou mécanicien). */
  canManage: boolean
}

/** Onglet « Équipements » (VehiculeEquipementsTab.vue), rechargé à chaque ouverture de l'onglet. */
export function VehicleEquipementsTab({ vehiculeId, canManage }: VehicleEquipementsTabProps) {
  const equipementsQuery = useVehicleEquipementsQuery(vehiculeId)
  const dialogs = useDialogState<'form' | 'delete', VehiculeEquipementDTO>()

  const renderContent = () => {
    if (equipementsQuery.isPending) {
      return <TabContentSkeleton variant="grid" label="Chargement des équipements..." />
    }

    if (equipementsQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(
            equipementsQuery.error,
            'Erreur lors du chargement des équipements',
          )}
          onRetry={() => void equipementsQuery.refetch()}
          isRetrying={equipementsQuery.isRefetching}
        />
      )
    }

    const equipements = equipementsQuery.data

    if (equipements.length === 0) {
      return (
        <Empty className="gap-4 p-0 py-12 md:p-0 md:py-12">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Wrench className="size-8" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Aucun équipement</p>
            <p className="text-sm text-muted-foreground">
              {canManage
                ? 'Ajoutez un équipement pour commencer.'
                : 'Aucun équipement enregistré pour ce véhicule.'}
            </p>
          </div>
        </Empty>
      )
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {equipements.map((equipement, index) => (
          <EquipementCard
            key={equipement.id ?? index}
            equipement={equipement}
            canManage={canManage}
            onEdit={(item) => dialogs.open('form', item)}
            onDelete={(item) => dialogs.open('delete', item)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Équipements du véhicule</h3>
        {canManage && (
          <Button type="button" size="sm" onClick={() => dialogs.open('form')}>
            <Plus className="mr-2 size-4" />
            Ajouter
          </Button>
        )}
      </div>

      {renderContent()}

      <EquipementFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        vehiculeId={vehiculeId}
        equipement={dialogs.type === 'form' ? dialogs.item : null}
      />
      <EquipementDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        vehiculeId={vehiculeId}
        equipement={dialogs.type === 'delete' ? dialogs.item : null}
      />
    </div>
  )
}
