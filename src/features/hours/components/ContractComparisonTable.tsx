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
import { ContractCreditedHours } from './ContractCreditedHours'
import { ContractForecast } from './ContractForecast'
import { ContractProgressBar } from './ContractProgressBar'

const CENTER = { headerClassName: 'text-center', cellClassName: 'text-center' }

const FORECAST_COLUMN: ColumnDef<ContractRow, unknown> = {
  id: 'heuresPrevisionnelles',
  accessorFn: (row) => row.heuresPrevisionnelles,
  header: ({ column }) => <DataTableColumnHeader column={column} title="Prévision" />,
  cell: ({ row }) => <ContractForecast row={row.original} />,
  meta: CENTER,
}

const buildColumns = (count: number, showForecast: boolean): ColumnDef<ContractRow, unknown>[] => [
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
      <span className="font-semibold text-violet-600 dark:text-violet-400">
        {formatContractHours(row.original.heuresEffectuees)}
      </span>
    ),
    meta: CENTER,
  },
  {
    id: 'heuresCreditees',
    accessorFn: (row) => row.heuresCreditees,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Créditées" />,
    cell: ({ row }) => <ContractCreditedHours row={row.original} />,
    meta: CENTER,
  },
  {
    id: 'heuresTotal',
    accessorFn: (row) => row.heuresTotal,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => (
      <span className="text-lg font-bold text-foreground">
        {formatContractHours(row.original.heuresTotal)}
      </span>
    ),
    meta: CENTER,
  },
  {
    id: 'differenceTotal',
    accessorFn: (row) => row.differenceTotal,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Écart" />,
    cell: ({ row }) => (
      <span className={cn('font-bold', getDifferenceClass(row.original.differenceTotal))}>
        {formatDifference(row.original.differenceTotal)}
      </span>
    ),
    meta: CENTER,
  },
  {
    id: 'pourcentageTotal',
    accessorFn: (row) => row.pourcentageTotal,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Réalisation" />,
    cell: ({ row }) => {
      const pct = row.original.pourcentageTotal
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
  ...(showForecast ? [FORECAST_COLUMN] : []),
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
    id: 'moyenneHeuresParJour',
    accessorFn: (row) => row.moyenneHeuresParJour,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Moy. / jour" />,
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
  /** Colonne « Prévision » de fin de mois (D10). */
  showForecast: boolean
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

/**
 * Tableau desktop contrat / heures, neuf colonnes triables. D8 : heures créditées (absences +
 * fériés) et total ; l'écart et la réalisation portent sur le total. D10 : dixième colonne,
 * prévision de fin de mois, pour le mois en cours et les mois à venir.
 */
export function ContractComparisonTable({
  rows,
  showForecast,
  sorting,
  onSortingChange,
}: ContractComparisonTableProps) {
  return (
    <DataTable
      columns={buildColumns(rows.length, showForecast)}
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
