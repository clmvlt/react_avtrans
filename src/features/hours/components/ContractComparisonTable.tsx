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
  type ContractForecastColumn,
  type ContractRow,
} from '../lib/contractFormat'
import { ContractCreditedHours } from './ContractCreditedHours'
import { ContractForecast } from './ContractForecast'
import { ContractProgressBar } from './ContractProgressBar'

const CENTER = { headerClassName: 'text-center', cellClassName: 'text-center' }

const buildForecastColumn = (
  joursOuvresRestantsMois: number | null,
): ColumnDef<ContractRow, unknown> => ({
  id: 'pourcentagePrevisionnel',
  accessorFn: (row) => row.pourcentagePrevisionnel,
  header: ({ column }) => <DataTableColumnHeader column={column} title="Réalisation prévue" />,
  cell: ({ row }) => (
    <ContractForecast row={row.original} joursOuvresRestantsMois={joursOuvresRestantsMois} />
  ),
  meta: CENTER,
})

const buildColumns = (
  count: number,
  forecast: ContractForecastColumn,
): ColumnDef<ContractRow, unknown>[] => [
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
  ...(forecast ? [buildForecastColumn(forecast.joursOuvresRestantsMois)] : []),
]

type ContractComparisonTableProps = {
  /** Lignes déjà filtrées et triées (tri du Vue, partagé avec les cartes mobiles). */
  rows: ContractRow[]
  /** Colonne « Réalisation prévue » (D10), `null` pour un mois passé. */
  forecast: ContractForecastColumn
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

/**
 * Tableau desktop contrat / heures, colonnes triables. D8 : heures créditées (absences + fériés)
 * et total ; l'écart et la réalisation portent sur le total. D10 : « Réalisation prévue » à la fin
 * du mois pour le mois en cours et les mois à venir (les jours travaillés et la moyenne par jour
 * ont été retirés à la demande du propriétaire).
 */
export function ContractComparisonTable({
  rows,
  forecast,
  sorting,
  onSortingChange,
}: ContractComparisonTableProps) {
  return (
    <DataTable
      columns={buildColumns(rows.length, forecast)}
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
