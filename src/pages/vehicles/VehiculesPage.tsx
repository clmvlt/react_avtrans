import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { SortingState } from '@tanstack/react-table'
import { ErrorState } from '@/components/shared/ErrorState'
import { useVehiclesQuery } from '@/features/vehicles/api/useVehiclesQuery'
import { VehicleCreateDialog } from '@/features/vehicles/components/dialogs/VehicleCreateDialog'
import { VehicleDeleteDialog } from '@/features/vehicles/components/dialogs/VehicleDeleteDialog'
import { VehiclesDataTable } from '@/features/vehicles/components/list/VehiclesDataTable'
import { VehiclesListSkeleton } from '@/features/vehicles/components/list/VehiclesListSkeleton'
import { VehiclesMobileList } from '@/features/vehicles/components/list/VehiclesMobileList'
import { VehiclesToolbar } from '@/features/vehicles/components/list/VehiclesToolbar'
import { getErrorMessage } from '@/features/vehicles/lib/errors'
import { filterVehicles, sortVehicles } from '@/features/vehicles/lib/vehicleList'
import { useDialogState } from '@/hooks/useDialogState'
import { usePermissions } from '@/hooks/usePermissions'
import type { VehiculeDTO } from '@/models'

/**
 * Parc de véhicules (`/vehicules`, admin ou mécanicien). Recherche et tri en état local, perdus en
 * quittant la page, comme le Vue. Cartes sous md, table au-delà.
 */
export default function VehiculesPage() {
  const navigate = useNavigate()
  const vehiclesQuery = useVehiclesQuery()
  const { isAdmin, isMechanic } = usePermissions()
  // Toujours vrai derrière la garde « mécanicien » (branches « lecture seule » mortes du Vue)
  const canManage = isAdmin || isMechanic

  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const dialogs = useDialogState<'create' | 'delete', VehiculeDTO>()

  const actions = {
    canDelete: canManage,
    onDetails: (vehicule: VehiculeDTO) => {
      if (vehicule.id) navigate(`/vehicules/${vehicule.id}`)
    },
    onEntretiens: (vehicule: VehiculeDTO) => {
      if (vehicule.id) navigate(`/entretiens/vehicule/${vehicule.id}`)
    },
    onDelete: (vehicule: VehiculeDTO) => dialogs.open('delete', vehicule),
  }

  const renderContent = () => {
    if (vehiclesQuery.isPending) return <VehiclesListSkeleton />

    if (vehiclesQuery.isError) {
      return (
        <ErrorState
          message={getErrorMessage(vehiclesQuery.error, 'Erreur lors du chargement des véhicules')}
          onRetry={() => void vehiclesQuery.refetch()}
          isRetrying={vehiclesQuery.isRefetching}
        />
      )
    }

    const filtered = filterVehicles(vehiclesQuery.data, search)

    return (
      <div className="space-y-4">
        <VehiclesToolbar
          search={search}
          onSearchChange={setSearch}
          canCreate={canManage}
          onCreate={() => dialogs.open('create')}
        />
        <VehiclesMobileList vehicules={sortVehicles(filtered, sorting)} {...actions} />
        <VehiclesDataTable
          vehicules={filtered}
          sorting={sorting}
          onSortingChange={setSorting}
          {...actions}
        />
      </div>
    )
  }

  return (
    <main className="px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-[1400px] space-y-6">{renderContent()}</div>

      <VehicleCreateDialog open={dialogs.isOpen('create')} onOpenChange={dialogs.onOpenChange} />
      <VehicleDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        vehicule={dialogs.item}
      />
    </main>
  )
}
