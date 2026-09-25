import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import { Clock } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserIdentity } from '@/components/shared/UserIdentity'
import { cn } from '@/lib/utils'
import { formatDecimalHours, getHoursClass, type UserHoursRow } from '../lib/hoursFormat'
import { HoursPresenceBadge } from './HoursPresenceBadge'

const CENTER = { headerClassName: 'text-center', cellClassName: 'text-center' }

type HoursColumnKey = 'hoursDay' | 'hoursWeek' | 'hoursMonth' | 'hoursLastMonth' | 'hoursYear'

const hoursColumn = (id: HoursColumnKey, title: string): ColumnDef<UserHoursRow, unknown> => ({
  id,
  accessorFn: (row) => row[id],
  header: ({ column }) => <DataTableColumnHeader column={column} title={title} />,
  cell: ({ row }) => (
    <span className={cn('text-lg font-bold', getHoursClass(row.original[id]))}>
      {formatDecimalHours(row.original[id])}
    </span>
  ),
  meta: CENTER,
})

const buildColumns = (count: number): ColumnDef<UserHoursRow, unknown>[] => [
  {
    id: 'fullName',
    accessorFn: (row) => row.fullName,
    header: ({ column }) => <DataTableColumnHeader column={column} title={`Employés (${count})`} />,
    cell: ({ row }) => <UserIdentity user={row.original.user} />,
  },
  {
    id: 'statusSort',
    accessorFn: (row) => row.statusSort,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Présence" />,
    cell: ({ row }) => <HoursPresenceBadge status={row.original.user?.status} />,
  },
  hoursColumn('hoursDay', "Aujourd'hui"),
  hoursColumn('hoursWeek', 'Semaine'),
  hoursColumn('hoursMonth', 'Mois'),
  hoursColumn('hoursLastMonth', 'Mois dernier'),
  hoursColumn('hoursYear', 'Année'),
]

type UsersHoursTableProps = {
  /** Lignes déjà filtrées et triées (tri du Vue, partagé avec les cartes mobiles). */
  rows: UserHoursRow[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

/** Tableau desktop des heures par employé, colonnes triables. */
export function UsersHoursTable({ rows, sorting, onSortingChange }: UsersHoursTableProps) {
  return (
    <DataTable
      columns={buildColumns(rows.length)}
      data={rows}
      getRowId={(row, index) => row.user?.uuid ?? String(index)}
      sorting={sorting}
      onSortingChange={onSortingChange}
      manualSorting
      emptyIcon={Clock}
      emptyMessage="Aucun employé trouvé"
      className="hidden md:block"
    />
  )
}
