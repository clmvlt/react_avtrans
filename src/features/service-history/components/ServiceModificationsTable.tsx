import type { ColumnDef } from '@tanstack/react-table'
import { History } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import type { ServiceModificationDTO } from '@/models'
import { formatParisDateTime } from '@/utils/timeFormatters'
import { ModificationUser } from './ModificationUser'
import { ServiceModificationActionBadge } from './ServiceModificationActionBadge'
import { ServiceModificationSummary } from './ServiceModificationSummary'

const buildColumns = (
  onOpen: (serviceUuid: string) => void,
): ColumnDef<ServiceModificationDTO, unknown>[] => [
  {
    id: 'createdAt',
    header: "Date de l'action",
    cell: ({ row }) => formatParisDateTime(row.original.createdAt),
    meta: { cellClassName: 'whitespace-nowrap text-sm text-muted-foreground' },
  },
  {
    id: 'modifiedBy',
    header: 'Administrateur',
    cell: ({ row }) => (
      <ModificationUser user={row.original.modifiedBy} missingLabel="Administrateur supprimé" />
    ),
  },
  {
    id: 'user',
    header: 'Employé',
    cell: ({ row }) => <ModificationUser user={row.original.user} />,
  },
  {
    id: 'action',
    header: 'Action',
    cell: ({ row }) => <ServiceModificationActionBadge action={row.original.action} />,
  },
  {
    id: 'summary',
    header: 'Avant → après',
    cell: ({ row }) => <ServiceModificationSummary modification={row.original} />,
  },
  {
    id: 'history',
    header: () => <span className="sr-only">Historique</span>,
    cell: ({ row }) => (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        title="Historique du pointage"
        aria-label="Historique du pointage"
        onClick={(event) => {
          event.stopPropagation()
          onOpen(row.original.serviceUuid)
        }}
      >
        <History className="size-3.5" />
      </Button>
    ),
    meta: { headerClassName: 'w-12', cellClassName: 'text-right' },
  },
]

type ServiceModificationsTableProps = {
  modifications: ServiceModificationDTO[]
  /** Texte de la ligne vide (dépend des filtres saisis). */
  emptyText: string
  onOpen: (serviceUuid: string) => void
}

/** Tableau desktop du journal : un clic sur une ligne ouvre l'historique du pointage. */
export function ServiceModificationsTable({
  modifications,
  emptyText,
  onOpen,
}: ServiceModificationsTableProps) {
  return (
    <DataTable
      columns={buildColumns(onOpen)}
      data={modifications}
      getRowId={(modification) => modification.uuid}
      onRowClick={(modification) => onOpen(modification.serviceUuid)}
      emptyIcon={History}
      emptyMessage={emptyText}
      className="hidden md:block"
    />
  )
}
