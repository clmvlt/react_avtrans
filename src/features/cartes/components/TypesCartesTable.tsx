import type { ColumnDef } from '@tanstack/react-table'
import { Tag } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import type { TypeCarteDTO } from '@/models'
import { formatLongDate } from '../lib/cartes'

type TypesCartesTableProps = {
  types: TypeCarteDTO[]
  onEdit: (typeCarte: TypeCarteDTO) => void
  onDelete: (typeCarte: TypeCarteDTO) => void
}

/** Table des types de cartes (desktop), sans tri ni pagination. */
export function TypesCartesTable({ types, onEdit, onDelete }: TypesCartesTableProps) {
  const columns: ColumnDef<TypeCarteDTO>[] = [
    {
      id: 'nom',
      header: `Types de cartes (${types.length})`,
      cell: ({ row: { original: type } }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Tag className="size-4" />
          </div>
          <span className="font-medium text-foreground">{type.nom}</span>
        </div>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row: { original: type } }) => (
        <span className="text-sm text-muted-foreground">{type.description || '-'}</span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Créé le',
      cell: ({ row: { original: type } }) => (
        <span className="text-sm text-muted-foreground">{formatLongDate(type.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row: { original: type } }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            title="Modifier"
            onClick={() => onEdit(type)}
          >
            Modifier
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            size="sm"
            title="Supprimer"
            onClick={() => onDelete(type)}
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
      data={types}
      getRowId={(type, index) => type.uuid ?? String(index)}
      emptyState={<span className="text-muted-foreground">Aucun type de carte configuré</span>}
      className="hidden md:block"
    />
  )
}
