import { useState } from 'react'
import { Package, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageTabs } from '@/components/layout/PageTabs'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useVehiclesQuery } from '@/features/vehicles/api/useVehiclesQuery'
import { useDossiersQuery } from '@/features/maintenance/api/useDossiersQuery'
import { useFleetUpcomingQuery } from '@/features/maintenance/api/useFleetUpcomingQuery'
import { useTypesEntretienQuery } from '@/features/maintenance/api/useTypesEntretienQuery'
import { EntretienDeleteDialog } from '@/features/maintenance/components/EntretienDeleteDialog'
import { EntretiensViewTabs } from '@/features/maintenance/components/EntretiensViewTabs'
import { FleetDashboard } from '@/features/maintenance/components/fleet/FleetDashboard'
import { EntretienFilesDialog } from '@/features/maintenance/components/files/EntretienFilesDialog'
import { EntretienFormDialog } from '@/features/maintenance/components/form/EntretienFormDialog'
import { EntretiensHistory } from '@/features/maintenance/components/history/EntretiensHistory'
import { useEntretiensHistory } from '@/features/maintenance/hooks/useEntretiensHistory'
import { useFleetEntretienForm } from '@/features/maintenance/hooks/useFleetEntretienForm'
import type { EntretienRow } from '@/features/maintenance/lib/entretienRow'
import { buildHistoryFilterConfig } from '@/features/maintenance/lib/historySearch'
import { MAINTENANCE_TABS } from '@/features/maintenance/lib/maintenanceTabs'
import { useDialogState } from '@/hooks/useDialogState'
import { cn } from '@/lib/utils'
import { selectIsAdmin, useAuthStore } from '@/stores/auth-store'

const TAB_CONTENT_CLASS = 'data-[state=inactive]:hidden'

/**
 * /entretiens (Entretiens.vue) : tableau de bord des prochains entretiens de la flotte et
 * historique de tous les entretiens.
 */
export default function EntretiensPage() {
  // Bug B-04 reproduit (Entretiens.vue:1079) : les droits de gestion testent l'UUID
  // administrateur. Le mécanicien est en lecture seule sur cette page (pas de création,
  // modification, suppression ni gestion des fichiers, pas d'accès aux types ni au stock).
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
    <PageContainer>
      <PageHeader
        title="Entretiens"
        description="Suivi et historique des entretiens de la flotte."
        actions={
          canManage && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/stock">
                  <Package className="size-4" />
                  Stock
                </Link>
              </Button>
              <Button type="button" size="sm" onClick={form.openCreate}>
                <Plus className="size-4" />
                Nouvel entretien
              </Button>
            </>
          )
        }
      >
        {/* Onglet « Types d'entretien » réservé à l'admin, comme son bouton dans le Vue (B-04) */}
        {canManage && <PageTabs tabs={MAINTENANCE_TABS} />}
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <EntretiensViewTabs
          upcomingCount={upcoming.data?.length ?? 0}
          totalCount={history.totalElements}
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

        <TabsContent value="historique" forceMount className={cn(TAB_CONTENT_CLASS, 'space-y-4')}>
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
      </Tabs>

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
    </PageContainer>
  )
}
