import type { ColumnDef } from '@tanstack/react-table'
import { FolderOpen, Pencil, Trash2, User } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatLongDate } from '../../lib/entretienDates'
import {
  formatCout,
  formatKm,
  getEntretienFileCount,
  mecanicienShortName,
  type EntretienRow,
  type EntretienRowActions,
} from '../../lib/entretienRow'
import { entretienSortValue } from '../../lib/historySearch'

type EntretienColumnsOptions = EntretienRowActions & {
  /** Colonne « Véhicule » (/entretiens). */
  showVehicle: boolean
  /** Colonne « Actions » (Modifier / Supprimer). */
  canManage: boolean
}

/** Colonne triable par l'en-tête (tri client à 3 états, voir `sortEntretiens`). */
function sortableColumn(
  id: string,
  title: string,
  column: Pick<ColumnDef<EntretienRow>, 'cell' | 'meta'>,
): ColumnDef<EntretienRow> {
  return {
    id,
    accessorFn: (entretien) => entretienSortValue(entretien, id),
    header: ({ column: tableColumn }) => (
      <DataTableColumnHeader column={tableColumn} title={title} />
    ),
    ...column,
  }
}

/**
 * Colonnes de la table de l'historique (Entretiens.vue et EntretiensVehicule.vue) : mêmes
 * contenus, largeurs et alignements que le Vue.
 */
export function getEntretienColumns({
  showVehicle,
  canManage,
  onOpenFiles,
  onEdit,
  onDelete,
}: EntretienColumnsOptions): ColumnDef<EntretienRow>[] {
  return [
    sortableColumn('dateEntretien', 'Date', {
      cell: ({ row }) => formatLongDate(row.original.dateEntretien),
      meta: { headerClassName: 'w-[100px]', cellClassName: 'text-sm text-muted-foreground' },
    }),
    ...(showVehicle
      ? [
          sortableColumn('vehiculeImmat', 'Véhicule', {
            cell: ({ row }) => <span className="font-medium">{row.original.vehiculeImmat}</span>,
          }),
        ]
      : []),
    sortableColumn('type', 'Type', {
      cell: ({ row }) => <Badge variant="secondary">{row.original.typeEntretien?.nom}</Badge>,
    }),
    sortableColumn('kilometrage', 'Km', {
      cell: ({ row }) => `${formatKm(row.original.kilometrage)} km`,
      meta: {
        headerClassName: 'w-[100px] text-right',
        cellClassName: 'text-right font-mono text-sm',
      },
    }),
    {
      id: 'commentaire',
      header: 'Commentaire',
      enableSorting: false,
      cell: ({ row }) =>
        row.original.commentaire ? (
          <span className="max-w-[200px] truncate text-sm" title={row.original.commentaire}>
            {row.original.commentaire}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    sortableColumn('mecanicien', 'Mécanicien', {
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-sm">
          <User className="size-3.5 text-muted-foreground" />
          <span>{mecanicienShortName(row.original)}</span>
        </div>
      ),
      meta: { headerClassName: 'w-[120px]' },
    }),
    sortableColumn('cout', 'Coût HT', {
      cell: ({ row }) =>
        row.original.cout ? (
          <span>{formatCout(row.original.cout)}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      meta: { headerClassName: 'w-[100px] text-right', cellClassName: 'text-right text-sm' },
    }),
    {
      id: 'files',
      header: 'Fichiers',
      enableSorting: false,
      cell: ({ row }) => {
        const count = getEntretienFileCount(row.original)
        if (count === 0) return <span className="text-muted-foreground">-</span>
        return (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-primary transition-colors hover:bg-accent"
            title={`Voir ${count} fichier(s)`}
            onClick={(event) => {
              event.stopPropagation()
              onOpenFiles(row.original)
            }}
          >
            <FolderOpen className="size-3.5" />
            <span>{count}</span>
          </button>
        )
      },
      meta: { headerClassName: 'w-[80px] text-center', cellClassName: 'text-center' },
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: ({ row }) => (
              <div className="flex justify-end gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  title="Modifier"
                  aria-label="Modifier"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit(row.original)
                  }}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  title="Supprimer"
                  aria-label="Supprimer"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDelete(row.original)
                  }}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ),
            meta: { headerClassName: 'w-[80px] text-right', cellClassName: 'text-right' },
          } satisfies ColumnDef<EntretienRow>,
        ]
      : []),
  ]
}
