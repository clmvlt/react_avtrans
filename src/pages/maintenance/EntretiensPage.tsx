import { useState } from 'react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useVehiclesQuery } from '@/features/vehicles/api/useVehiclesQuery'
import { useDossiersQuery } from '@/features/maintenance/api/useDossiersQuery'
import { useFleetUpcomingQuery } from '@/features/maintenance/api/useFleetUpcomingQuery'
import { useTypesEntretienQuery } from '@/features/maintenance/api/useTypesEntretienQuery'
import { EntretienDeleteDialog } from '@/features/maintenance/components/EntretienDeleteDialog'
import { EntretiensHeader } from '@/features/maintenance/components/EntretiensHeader'
import { FleetDashboard } from '@/features/maintenance/components/fleet/FleetDashboard'
import { EntretienFilesDialog } from '@/features/maintenance/components/files/EntretienFilesDialog'
import { EntretienFormDialog } from '@/features/maintenance/components/form/EntretienFormDialog'
import { EntretiensHistory } from '@/features/maintenance/components/history/EntretiensHistory'
import { useEntretiensHistory } from '@/features/maintenance/hooks/useEntretiensHistory'
import { useFleetEntretienForm } from '@/features/maintenance/hooks/useFleetEntretienForm'
import type { EntretienRow } from '@/features/maintenance/lib/entretienRow'
import { buildHistoryFilterConfig } from '@/features/maintenance/lib/historySearch'
import { useDialogState } from '@/hooks/useDialogState'
import { cn } from '@/lib/utils'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'

const TAB_CONTENT_CLASS = 'mt-0 bg-background p-6 data-[state=inactive]:hidden'

/**
 * /entretiens (Entretiens.vue) : tableau de bord des prochains entretiens de la flotte et
 * historique de tous les entretiens.
 */
export default function EntretiensPage() {
  // Bug B-04 reproduit (Entretiens.vue:1079) : les droits de gestion testent l'UUID
  // administrateur. Le mécanicien est en lecture seule sur cette page (pas de création,
  // modification, suppression ni gestion des fichiers, pas de boutons Types / Stock).
  const canManage = useAuthStore(selectIsAdmin)
  const [tab, setTab] = useState('prochains')

  const upcoming = useFleetUpcomingQuery()
  const vehicles = useVehiclesQuery()
  const types = useTypesEntretienQuery()
  const dossiers = useDossiersQuery()
  const typeList = types.data ?? []
  const vehiculeList = vehicles.data ?? []
  const dossierList = dossiers.data ?? []

  const history = useEntretiensHistory({ types: typeList })
  const form = useFleetEntretienForm(typeList)
  const dialogs = useDialogState<'files' | 'delete', EntretienRow>()

  const fleetError = upcoming.isError || vehicles.isError || types.isError
  const retryFleet = () => {
    if (upcoming.isError) void upcoming.refetch()
    if (vehicles.isError) void vehicles.refetch()
    if (types.isError) void types.refetch()
  }

  const rowActions = {
    onOpenFiles: (entretien: EntretienRow) => dialogs.open('files', entretien),
    onEdit: form.openEdit,
    onDelete: (entretien: EntretienRow) => dialogs.open('delete', entretien),
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px]">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="overflow-hidden rounded-lg border border-border">
              <EntretiensHeader
                canManage={canManage}
                upcomingCount={upcoming.data?.length ?? 0}
                totalCount={history.totalElements}
                onCreate={form.openCreate}
              />

              <TabsContent value="prochains" forceMount className={TAB_CONTENT_CLASS}>
                {fleetError ? (
                  <ErrorState
                    message="Erreur lors du chargement des données"
                    onRetry={retryFleet}
                    isRetrying={upcoming.isFetching || vehicles.isFetching || types.isFetching}
                  />
                ) : (
                  <FleetDashboard
                    isLoading={upcoming.isPending || vehicles.isPending}
                    prochains={upcoming.data ?? []}
                    vehicules={vehiculeList}
                  />
                )}
              </TabsContent>

              <TabsContent
                value="historique"
                forceMount
                className={cn(TAB_CONTENT_CLASS, 'space-y-4')}
              >
                <EntretiensHistory
                  variant="fleet"
                  history={history}
                  filterConfig={buildHistoryFilterConfig({
                    vehicules: vehiculeList,
                    dossiers: dossierList,
                    types: typeList,
                    dossierId: history.filters.dossierId,
                  })}
                  canManage={canManage}
                  {...rowActions}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <EntretienFormDialog
        open={form.open}
        onOpenChange={form.onOpenChange}
        formKey={form.key}
        entretien={form.entretien}
        defaultValues={form.defaultValues}
        vehicules={vehiculeList}
        dossiers={dossierList}
        types={typeList}
        onDossierChange={form.onDossierChange}
      />

      <EntretienFilesDialog
        variant="fleet"
        open={dialogs.isOpen('files')}
        onOpenChange={dialogs.onOpenChange}
        entretien={dialogs.item}
        canManage={canManage}
      />

      <EntretienDeleteDialog
        variant="inline"
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        entretien={dialogs.item}
      />
    </div>
  )
}
