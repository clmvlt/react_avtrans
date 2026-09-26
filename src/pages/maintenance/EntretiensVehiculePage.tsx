import { useState } from 'react'
import { useParams } from 'react-router'
import { ErrorState } from '@/components/shared/ErrorState'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useVehicleQuery } from '@/features/vehicles/api/useVehicleQuery'
import { useDossiersQuery } from '@/features/maintenance/api/useDossiersQuery'
import { useTypesEntretienQuery } from '@/features/maintenance/api/useTypesEntretienQuery'
import { useVehicleUpcomingQuery } from '@/features/maintenance/api/useVehicleUpcomingQuery'
import { useVehiculeConfigsQuery } from '@/features/maintenance/api/useVehiculeConfigsQuery'
import { VehiculeConfigsPanel } from '@/features/maintenance/components/config/VehiculeConfigsPanel'
import { EntretienDeleteDialog } from '@/features/maintenance/components/EntretienDeleteDialog'
import { EntretienFilesDialog } from '@/features/maintenance/components/files/EntretienFilesDialog'
import { VehiculeEntretienFormDialog } from '@/features/maintenance/components/form/VehiculeEntretienFormDialog'
import { EntretiensHistory } from '@/features/maintenance/components/history/EntretiensHistory'
import { ValidateEntretienDialog } from '@/features/maintenance/components/vehicule/ValidateEntretienDialog'
import { VehicleUpcomingAlerts } from '@/features/maintenance/components/vehicule/VehicleUpcomingAlerts'
import { VehiculeEntretiensHeader } from '@/features/maintenance/components/vehicule/VehiculeEntretiensHeader'
import { useCanManageMaintenance } from '@/features/maintenance/hooks/useCanManageMaintenance'
import { useEntretiensHistory } from '@/features/maintenance/hooks/useEntretiensHistory'
import type { EntretienRow } from '@/features/maintenance/lib/entretienRow'
import { buildHistoryFilterConfig } from '@/features/maintenance/lib/historySearch'
import { notifyError } from '@/features/maintenance/lib/notify'
import { useDialogState } from '@/hooks/useDialogState'
import { cn } from '@/lib/utils'
import type { TypeEntretienDTO } from '@/models'

const TAB_CONTENT_CLASS = 'mt-0 bg-background p-4 md:p-6 data-[state=inactive]:hidden'

type FormState = { open: boolean; key: number; entretien: EntretienRow | null }
type ValidationState = { open: boolean; typeEntretien: TypeEntretienDTO | null }

/**
 * /entretiens/vehicule/:id (EntretiensVehicule.vue) : échéances, historique et configurations
 * d'entretien d'un véhicule. Le contenu est remonté quand l'`id` change (état remis à zéro).
 */
export default function EntretiensVehiculePage() {
  const { id = '' } = useParams()
  return <EntretiensVehiculeContent key={id} vehiculeId={id} />
}

function EntretiensVehiculeContent({ vehiculeId }: { vehiculeId: string }) {
  const canManage = useCanManageMaintenance()
  const [tab, setTab] = useState('entretiens')

  const vehicle = useVehicleQuery(vehiculeId)
  const upcoming = useVehicleUpcomingQuery(vehiculeId)
  const types = useTypesEntretienQuery()
  const dossiers = useDossiersQuery()
  const configs = useVehiculeConfigsQuery(vehiculeId)
  const typeList = types.data ?? []

  const history = useEntretiensHistory({ vehiculeId, types: typeList })
  const dialogs = useDialogState<'files' | 'delete', EntretienRow>()
  const [form, setForm] = useState<FormState>({ open: false, key: 0, entretien: null })
  const [validation, setValidation] = useState<ValidationState>({
    open: false,
    typeEntretien: null,
  })

  const openForm = (entretien: EntretienRow | null) =>
    setForm((current) => ({ open: true, key: current.key + 1, entretien }))

  const handleValidate = (typeEntretien: TypeEntretienDTO | undefined) => {
    if (!vehicle.data?.id || !typeEntretien?.id) {
      notifyError("Informations véhicule ou type d'entretien manquantes")
      return
    }
    setValidation({ open: true, typeEntretien })
  }

  const loadError = vehicle.isError || types.isError
  const retryLoad = () => {
    if (vehicle.isError) void vehicle.refetch()
    if (types.isError) void types.refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px]">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="overflow-hidden rounded-lg border border-border">
              <VehiculeEntretiensHeader
                vehiculeId={vehiculeId}
                vehicule={vehicle.data}
                configCount={configs.data?.length ?? 0}
                canManage={canManage}
                onCreate={() => openForm(null)}
              />

              <TabsContent
                value="entretiens"
                forceMount
                className={cn(TAB_CONTENT_CLASS, 'space-y-6')}
              >
                {loadError ? (
                  <ErrorState
                    message="Erreur lors du chargement des données"
                    onRetry={retryLoad}
                    isRetrying={vehicle.isFetching || types.isFetching}
                  />
                ) : (
                  <>
                    <VehicleUpcomingAlerts
                      upcoming={upcoming.data}
                      canManage={canManage}
                      onValidate={handleValidate}
                    />
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-foreground">
                        Historique des entretiens
                      </h2>
                      <EntretiensHistory
                        variant="vehicule"
                        history={history}
                        filterConfig={buildHistoryFilterConfig({
                          dossiers: dossiers.data ?? [],
                          types: typeList,
                          dossierId: history.filters.dossierId,
                        })}
                        canManage={canManage}
                        onOpenFiles={(entretien) => dialogs.open('files', entretien)}
                        onEdit={openForm}
                        onDelete={(entretien) => dialogs.open('delete', entretien)}
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              {canManage && (
                <TabsContent
                  value="configurations"
                  forceMount
                  className={cn(TAB_CONTENT_CLASS, 'space-y-4')}
                >
                  <VehiculeConfigsPanel
                    vehiculeId={vehiculeId}
                    configsQuery={configs}
                    types={typeList}
                  />
                </TabsContent>
              )}
            </div>
          </Tabs>
        </div>
      </main>

      <VehiculeEntretienFormDialog
        open={form.open}
        onOpenChange={(open) => {
          if (!open) setForm((current) => ({ ...current, open: false }))
        }}
        formKey={form.key}
        vehiculeId={vehiculeId}
        entretien={form.entretien}
        types={typeList}
      />

      <EntretienFilesDialog
        variant="vehicule"
        open={dialogs.isOpen('files')}
        onOpenChange={dialogs.onOpenChange}
        entretien={dialogs.item}
        canManage={canManage}
      />

      <EntretienDeleteDialog
        variant="centered"
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        entretien={dialogs.item}
      />

      <ValidateEntretienDialog
        open={validation.open}
        onOpenChange={(open) => {
          if (!open) setValidation((current) => ({ ...current, open: false }))
        }}
        vehicule={vehicle.data}
        typeEntretien={validation.typeEntretien}
      />
    </div>
  )
}
