import { useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import type { RapportVehiculeDTO } from '@/models'
import { RAPPORTS_PAGE_SIZE, useVehicleRapportsQuery } from '../../../api/useVehicleRapportsQuery'
import { getErrorMessage } from '../../../lib/errors'
import { PicturesGridDialog } from '../../PicturesGridDialog'
import { TabContentSkeleton } from '../TabContentSkeleton'
import { RapportCard } from './RapportCard'

type VehicleRapportsTabProps = {
  vehiculeId: string
}

/**
 * Onglet « Rapports » (VehiculeRapportsTab.vue), en lecture seule. Comme le Vue, la liste revient
 * à la première page, paginée, à chaque retour sur l'onglet (état local de l'onglet).
 */
export function VehicleRapportsTab({ vehiculeId }: VehicleRapportsTabProps) {
  const [view, setView] = useState({ page: 0, showAll: false })
  const rapportsQuery = useVehicleRapportsQuery({ vehiculeId, ...view })
  const [selected, setSelected] = useState<{ open: boolean; rapport: RapportVehiculeDTO | null }>({
    open: false,
    rapport: null,
  })
  const totalElements = rapportsQuery.data?.totalElements ?? 0

  const renderContent = () => {
    if (rapportsQuery.isPending) {
      return <TabContentSkeleton variant="cards" label="Chargement des rapports..." />
    }

    if (rapportsQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(rapportsQuery.error, 'Erreur lors du chargement des rapports')}
          onRetry={() => void rapportsQuery.refetch()}
          isRetrying={rapportsQuery.isRefetching}
        />
      )
    }

    const { rapports } = rapportsQuery.data

    if (rapports.length === 0) {
      return (
        <Empty className="gap-4 p-0 py-16 text-muted-foreground md:p-0 md:py-16">
          <ClipboardList className="size-12 opacity-50" />
          <p>Aucun rapport enregistré</p>
        </Empty>
      )
    }

    return (
      <div className="space-y-3">
        {rapports.map((rapport, index) => (
          <RapportCard
            key={rapport.id ?? index}
            rapport={rapport}
            onViewPictures={(item) => setSelected({ open: true, rapport: item })}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">Rapports ({totalElements})</h3>
        {!view.showAll && totalElements > RAPPORTS_PAGE_SIZE && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setView({ page: 0, showAll: true })}
          >
            Voir tout
          </Button>
        )}
      </div>

      {renderContent()}

      {!view.showAll && (
        <SimplePagination
          variant="compact"
          page={rapportsQuery.data?.page ?? view.page}
          totalPages={rapportsQuery.data?.totalPages ?? 0}
          disabled={rapportsQuery.isPlaceholderData}
          onPageChange={(page) => setView({ page, showAll: false })}
        />
      )}

      <PicturesGridDialog
        open={selected.open}
        onOpenChange={(open) => setSelected((current) => ({ ...current, open }))}
        title="Photos du rapport"
        description="Galerie de photos du rapport"
        pictures={selected.rapport?.pictures ?? []}
        pictureAlt="Photo du rapport"
        emptyText="Aucune photo pour ce rapport"
      />
    </div>
  )
}
