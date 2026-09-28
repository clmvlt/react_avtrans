import type { ColumnDef, Row } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { Button } from '@/components/ui/button'
import type { VehiculeDTO } from '@/models'
import { formatDate, formatNumber } from '../../lib/formatters'
import { getVehicleOwnKm } from '../../lib/relais'
import { compareLikeVue, VEHICLE_SORT_VALUES } from '../../lib/vehicleList'
import { VehicleIdentity } from '../VehicleIdentity'

type VehiclesColumnsOptions = {
  canDelete: boolean
  onDetails: (vehicule: VehiculeDTO) => void
  onEntretiens: (vehicule: VehiculeDTO) => void
  onDelete: (vehicule: VehiculeDTO) => void
}

/** Tri du Vue (B-19 reproduit, voir `compareLikeVue`) ; les vides sont gérés par `sortUndefined`. */
const sortLikeVue = (rowA: Row<VehiculeDTO>, rowB: Row<VehiculeDTO>, columnId: string) =>
  compareLikeVue(rowA.getValue(columnId), rowB.getValue(columnId))

/**
 * Colonnes de la table desktop (Vehicules.vue:716) : clic sur l'en-tête = croissant puis
 * décroissant, sans retour à « non trié » ; vides en fin en croissant, en tête en décroissant
 * (`sortUndefined: 1`).
 */
export function getVehiclesColumns({
  canDelete,
  onDetails,
  onEntretiens,
  onDelete,
}: VehiclesColumnsOptions): ColumnDef<VehiculeDTO>[] {
  return [
    {
      id: 'immat',
      accessorFn: VEHICLE_SORT_VALUES.immat,
      sortingFn: sortLikeVue,
      sortUndefined: 1,
      header: ({ column, table }) => (
        <DataTableColumnHeader
          column={column}
          title={`Véhicules (${table.getCoreRowModel().rows.length})`}
        />
      ),
      cell: ({ row }) => <VehicleIdentity vehicule={row.original} />,
    },
    {
      id: 'latestKm',
      accessorFn: VEHICLE_SORT_VALUES.latestKm,
      sortingFn: sortLikeVue,
      sortUndefined: 1,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Kilométrage" />,
      cell: ({ row }) => {
        const { km } = getVehicleOwnKm(row.original)
        return km ? (
          <span className="font-medium text-foreground">{formatNumber(km)} km</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: 'latestKmDate',
      accessorFn: VEHICLE_SORT_VALUES.latestKmDate,
      sortingFn: sortLikeVue,
      sortUndefined: 1,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date du relevé" />,
      cell: ({ row }) => {
        const { date } = getVehicleOwnKm(row.original)
        return date ? (
          <span>{formatDate(date)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: 'comment',
      enableSorting: false,
      header: 'Commentaire',
      cell: ({ row }) =>
        row.original.comment ? (
          <span
            className="inline-block max-w-[200px] truncate text-sm text-muted-foreground italic"
            title={row.original.comment}
          >
            {row.original.comment}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: 'Actions',
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Voir les détails"
            onClick={() => onDetails(row.original)}
          >
            Détails
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Voir les entretiens"
            onClick={() => onEntretiens(row.original)}
          >
            Entretiens
          </Button>
          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              size="sm"
              title="Supprimer le véhicule"
              onClick={() => onDelete(row.original)}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ]
}
