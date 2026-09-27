import type { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table'
import { FileText } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserIdentity } from '@/components/shared/UserIdentity'
import { cn } from '@/lib/utils'
import {
  formatContractHours,
  formatDifference,
  formatPercentage,
  getDifferenceClass,
  getPercentageClass,
  type ContractRow,
} from '../lib/contractFormat'
import { ContractProgressBar } from './ContractProgressBar'

const CENTER = { headerClassName: 'text-center', cellClassName: 'text-center' }

const buildColumns = (count: number): ColumnDef<ContractRow, unknown>[] => [
  {
    id: 'fullName',
    accessorFn: (row) => row.fullName,
    header: ({ column }) => <DataTableColumnHeader column={column} title={`Employés (${count})`} />,
    cell: ({ row }) => <UserIdentity user={row.original.user} />,
  },
  {
    id: 'heureContrat',
    accessorFn: (row) => row.heureContrat,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Contrat" />,
    cell: ({ row }) =>
      row.original.heureContrat != null ? (
        <span className="font-medium text-foreground">
          {formatContractHours(row.original.heureContrat)}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground italic">Non défini</span>
      ),
    meta: CENTER,
  },
  {
    id: 'heuresEffectuees',
    accessorFn: (row) => row.heuresEffectuees,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Effectuées" />,
    cell: ({ row }) => (
      <span className="text-lg font-bold text-violet-600 dark:text-violet-400">
        {formatContractHours(row.original.heuresEffectuees)}
      </span>
    ),
    meta: CENTER,
  },
  {
    id: 'difference',
    accessorFn: (row) => row.difference,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Différence" />,
    cell: ({ row }) => (
      <span className={cn('text-lg font-bold', getDifferenceClass(row.original.difference))}>
        {formatDifference(row.original.difference)}
      </span>
    ),
    meta: CENTER,
  },
  {
    id: 'pourcentageRealisation',
    accessorFn: (row) => row.pourcentageRealisation,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Réalisation" />,
    cell: ({ row }) => {
      const pct = row.original.pourcentageRealisation
      if (pct == null) return <span className="text-sm text-muted-foreground">-</span>
      return (
        <div className="flex flex-col items-center gap-1">
          <span className={cn('text-sm font-bold', getPercentageClass(pct))}>
            {formatPercentage(pct)}
          </span>
          <ContractProgressBar percentage={pct} className="h-1.5 w-16" />
        </div>
      )
    },
    meta: CENTER,
  },
  {
    id: 'joursTravailles',
    accessorFn: (row) => row.joursTravailles,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Jours travaillés" />,
    cell: ({ row }) => (
      <>
        <span className="font-medium text-foreground">{row.original.joursTravailles}</span>
        <span className="text-muted-foreground"> / {row.original.joursOuvres}</span>
      </>
    ),
    meta: CENTER,
  },
  {
    id: 'joursAbsence',
    accessorFn: (row) => row.joursAbsence,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Absences" />,
    cell: ({ row }) => (
      <span
        className={
          row.original.joursAbsence > 0
            ? 'font-medium text-amber-600 dark:text-amber-400'
            : 'text-muted-foreground'
        }
      >
        {row.original.joursAbsence}j
      </span>
    ),
    meta: CENTER,
  },
  {
    id: 'moyenneHeuresParJour',
    accessorFn: (row) => row.moyenneHeuresParJour,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Moyenne / jour" />,
    cell: ({ row }) =>
      row.original.moyenneHeuresParJour != null ? (
        <span className="font-medium text-foreground">
          {formatContractHours(row.original.moyenneHeuresParJour)}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
    meta: CENTER,
  },
]

type ContractComparisonTableProps = {
  /** Lignes déjà filtrées et triées (tri du Vue, partagé avec les cartes mobiles). */
  rows: ContractRow[]
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

/** Tableau desktop contrat / heures effectuées, huit colonnes triables. */
export function ContractComparisonTable({
  rows,
  sorting,
  onSortingChange,
}: ContractComparisonTableProps) {
  return (
    <DataTable
      columns={buildColumns(rows.length)}
      data={rows}
      getRowId={(row, index) => row.user.uuid ?? String(index)}
      sorting={sorting}
      onSortingChange={onSortingChange}
      manualSorting
      emptyIcon={FileText}
      emptyMessage="Aucun employé trouvé"
      className="hidden md:block"
    />
  )
}
