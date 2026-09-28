import { useState } from 'react'
import { Gauge } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import type { VehiculeKilometrageDTO } from '@/models'
import { KM_PAGE_SIZE, useVehicleKilometragesQuery } from '../../../api/useVehicleKilometragesQuery'
import { getErrorMessage } from '../../../lib/errors'
import { INITIAL_KM_VIEW, type KmView } from '../../../lib/kmView'
import { TabContentSkeleton } from '../TabContentSkeleton'
import { EditKmDialog } from './EditKmDialog'
import { KmChart } from './KmChart'
import { KmTimelineItem } from './KmTimelineItem'

type VehicleKmTabProps = {
  vehiculeId: string
  /** Page affichée ou « Voir tout » : conservée d'un onglet à l'autre, comme dans le Vue. */
  view: KmView
  onViewChange: (view: KmView) => void
  /** Édition des relevés réservée à l'admin. */
  isAdmin: boolean
}

/**
 * Onglet « Historique km » (VehiculeKilometragesTab.vue) : graphique des relevés chargés (la page
 * affichée, ou tout après « Voir tout », sans retour possible à la vue paginée), puis la frise
 * dans l'ordre de l'API. D9 : les relevés d'un véhicule relais restent dans la frise, repérés par
 * sa plaque, mais pas dans la courbe du véhicule.
 */
export function VehicleKmTab({ vehiculeId, view, onViewChange, isAdmin }: VehicleKmTabProps) {
  const kmQuery = useVehicleKilometragesQuery({ vehiculeId, ...view })
  const [editing, setEditing] = useState<{ open: boolean; km: VehiculeKilometrageDTO | null }>({
    open: false,
    km: null,
  })

  const renderContent = () => {
    if (kmQuery.isPending) {
      return <TabContentSkeleton variant="timeline" label="Chargement des kilométrages..." />
    }

    if (kmQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(kmQuery.error, 'Erreur lors du chargement des kilométrages')}
          onRetry={() => void kmQuery.refetch()}
          isRetrying={kmQuery.isRefetching}
        />
      )
    }

    const { kilometrages, page, totalPages, totalElements } = kmQuery.data
    const vehicleKilometrages = kilometrages.filter((kilometrage) => !kilometrage.relaiId)
    const relaiCount = kilometrages.length - vehicleKilometrages.length

    if (kilometrages.length === 0) {
      return (
        <Empty className="gap-4 p-0 py-16 md:p-0 md:py-16">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Gauge className="size-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Aucun kilométrage enregistré</p>
        </Empty>
      )
    }

    return (
      <div className="space-y-6">
        {vehicleKilometrages.length > 0 && <KmChart kilometrages={vehicleKilometrages} />}
        {relaiCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {relaiCount} relevé{relaiCount > 1 ? 's' : ''} de véhicule relais, hors de la courbe du
            véhicule.
          </p>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">
              Historique détaillé ({totalElements})
            </h3>
            {!view.showAll && totalElements > KM_PAGE_SIZE && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onViewChange({ page: 0, showAll: true })}
              >
                Voir tout
              </Button>
            )}
          </div>

          <div className="space-y-0">
            {kilometrages.map((kilometrage, index) => (
              <KmTimelineItem
                key={kilometrage.id ?? index}
                kilometrage={kilometrage}
                isLast={index === kilometrages.length - 1}
                canEdit={isAdmin}
                onEdit={(km) => setEditing({ open: true, km })}
              />
            ))}
          </div>

          {!view.showAll && (
            <SimplePagination
              variant="compact"
              showLabels
              className="gap-4 py-0 pt-2"
              page={page}
              totalPages={totalPages}
              disabled={kmQuery.isPlaceholderData}
              onPageChange={(nextPage) => onViewChange({ page: nextPage, showAll: false })}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderContent()}

      {isAdmin && (
        <EditKmDialog
          open={editing.open}
          onOpenChange={(open) => setEditing((current) => ({ ...current, open }))}
          kilometrage={editing.km}
          onSaved={() => onViewChange(INITIAL_KM_VIEW)}
        />
      )}
    </div>
  )
}
