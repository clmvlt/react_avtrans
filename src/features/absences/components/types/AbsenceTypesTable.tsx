import type { ColumnDef } from '@tanstack/react-table'
import { CalendarX } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import type { AbsenceTypeDTO } from '@/models'
import { formatDateLong } from '../../lib/dateFormat'

type AbsenceTypesTableProps = {
  types: AbsenceTypeDTO[]
  onEdit: (type: AbsenceTypeDTO) => void
  onDelete: (type: AbsenceTypeDTO) => void
}

/** Table desktop (md+) des types d'absence : nom, couleur, date de création, actions. Pas de tri. */
export function AbsenceTypesTable({ types, onEdit, onDelete }: AbsenceTypesTableProps) {
  const columns: ColumnDef<AbsenceTypeDTO>[] = [
    {
      id: 'name',
      header: `Types d'absence (${types.length})`,
      enableSorting: false,
      cell: ({ row: { original: type } }) => (
        <div className="flex items-center gap-3">
          <span
            className="size-8 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: type.color }}
          />
          <span className="font-medium text-foreground">{type.name}</span>
        </div>
      ),
    },
    {
      id: 'color',
      header: 'Couleur',
      enableSorting: false,
      cell: ({ row: { original: type } }) => (
        <div className="flex items-center gap-2">
          <span
            className="size-5 shrink-0 rounded border border-border"
            style={{ backgroundColor: type.color }}
          />
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {type.color}
          </code>
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Créé le',
      enableSorting: false,
      cell: ({ row: { original: type } }) => (
        <span className="text-sm text-muted-foreground">{formatDateLong(type.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row: { original: type } }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button size="sm" title="Modifier" onClick={() => onEdit(type)}>
            Modifier
          </Button>
          <Button size="sm" variant="destructive" title="Supprimer" onClick={() => onDelete(type)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={types}
      getRowId={(type, index) => type.uuid ?? String(index)}
      emptyIcon={CalendarX}
      emptyMessage="Aucun type d'absence configuré"
      className="hidden md:block"
    />
  )
}
