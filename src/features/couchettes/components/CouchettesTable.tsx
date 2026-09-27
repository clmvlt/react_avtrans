import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import { BedDouble } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { CouchetteDTO } from '@/models'
import { formatCouchetteDate, formatCouchetteDateTime } from '../lib/couchetteDates'

type CouchettesTableProps = {
  /** Lignes déjà triées par la page (`sortCouchettes`), partagées avec la liste mobile. */
  couchettes: CouchetteDTO[]
  totalElements: number
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  onDetail: (couchette: CouchetteDTO) => void
  onDelete: (couchette: CouchetteDTO) => void
}

/**
 * Table desktop de /couchettes (`hidden md:block`). Le tri est calculé par la page sur les
 * lignes affichées (`manualSorting`) : la table ne fait qu'en refléter l'état dans les en-têtes.
 */
export function CouchettesTable({
  couchettes,
  totalElements,
  sorting,
  onSortingChange,
  onDetail,
  onDelete,
}: CouchettesTableProps) {
  const columns: ColumnDef<CouchetteDTO>[] = [
    {
      id: 'userName',
      accessorFn: (couchette) =>
        `${couchette.user?.firstName || ''} ${couchette.user?.lastName || ''}`.trim(),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`Couchettes (${totalElements})`} />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={row.original.user} />
          <span className="font-medium text-foreground">
            {row.original.user?.firstName} {row.original.user?.lastName}
          </span>
        </div>
      ),
    },
    {
      id: 'date',
      accessorKey: 'date',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {formatCouchetteDate(row.original.date)}
        </span>
      ),
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Créée le" />,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatCouchetteDateTime(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            title="Détails"
            onClick={(event) => {
              event.stopPropagation()
              onDetail(row.original)
            }}
          >
            Détails
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Supprimer"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(row.original)
            }}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={couchettes}
      getRowId={(couchette, index) => couchette.uuid ?? String(index)}
      sorting={sorting}
      onSortingChange={onSortingChange}
      manualSorting
      emptyIcon={BedDouble}
      emptyMessage="Aucune couchette trouvée"
      className="hidden md:block"
    />
  )
}
