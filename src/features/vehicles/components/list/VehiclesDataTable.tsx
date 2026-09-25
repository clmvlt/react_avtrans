import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { Eye, Truck, Trash2, Wrench } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { VehiculeDTO } from '@/models'
import { getVehiclesColumns } from './vehiclesColumns'

type VehiclesDataTableProps = {
  vehicules: VehiculeDTO[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  canDelete: boolean
  onDetails: (vehicule: VehiculeDTO) => void
  onEntretiens: (vehicule: VehiculeDTO) => void
  onDelete: (vehicule: VehiculeDTO) => void
}

/** Table des véhicules (md et plus), avec menu contextuel au clic droit sur chaque ligne. */
export function VehiclesDataTable({
  vehicules,
  sorting,
  onSortingChange,
  canDelete,
  onDetails,
  onEntretiens,
  onDelete,
}: VehiclesDataTableProps) {
  const columns = getVehiclesColumns({ canDelete, onDetails, onEntretiens, onDelete })

  return (
    <DataTable
      columns={columns}
      data={vehicules}
      getRowId={(vehicule, index) => vehicule.id ?? String(index)}
      sorting={sorting}
      onSortingChange={onSortingChange}
      emptyIcon={Truck}
      emptyMessage="Aucun véhicule trouvé"
      className="hidden md:block"
      renderRow={(row, rowElement) => (
        <ContextMenu>
          <ContextMenuTrigger asChild>{rowElement}</ContextMenuTrigger>
          <ContextMenuContent className="min-w-[12rem]">
            {row.original.immat && (
              <>
                <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
                  {row.original.immat}
                </ContextMenuLabel>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem onSelect={() => onDetails(row.original)}>
              <Eye className="size-4" />
              Détails
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => onEntretiens(row.original)}>
              <Wrench className="size-4" />
              Entretiens
            </ContextMenuItem>
            {canDelete && (
              <>
                <ContextMenuSeparator />
                <ContextMenuItem variant="destructive" onSelect={() => onDelete(row.original)}>
                  <Trash2 className="size-4" />
                  Supprimer
                </ContextMenuItem>
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>
      )}
    />
  )
}
