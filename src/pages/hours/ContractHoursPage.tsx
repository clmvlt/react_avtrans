import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { FileText, RefreshCw } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useContractComparisonQuery } from '@/features/hours/api/useContractComparisonQuery'
import { ContractComparisonCard } from '@/features/hours/components/ContractComparisonCard'
import { ContractComparisonTable } from '@/features/hours/components/ContractComparisonTable'
import { ContractStatsGrid } from '@/features/hours/components/ContractStatsGrid'
import { HoursPageSkeleton } from '@/features/hours/components/HoursPageSkeleton'
import { HoursSearchInput } from '@/features/hours/components/HoursSearchInput'
import { ListEmptyState } from '@/features/hours/components/ListEmptyState'
import { MonthYearPicker } from '@/features/hours/components/MonthYearPicker'
import {
  buildContractRows,
  computeContractTotals,
  getContractSortValue,
  getCurrentMonthYear,
  getYearOptions,
} from '@/features/hours/lib/contractFormat'
import { sortRowsLikeVue } from '@/features/hours/lib/legacySort'
import { cn } from '@/lib/utils'

/**
 * Heures contrat / heures effectuées par employé pour un mois (admin). La navigation de mois
 * reste disponible pendant le chargement et après une erreur (le Vue la masquait, sans
 * « Réessayer » : corrigé par construction, MIGRATION.md 8.1).
 */
export default function ContractHoursPage() {
  // Mois courant figé à l'ouverture de la page (valeur initiale, « Mois actuel », années)
  const [current] = useState(getCurrentMonthYear)
  const [period, setPeriod] = useState(current)
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const comparisonQuery = useContractComparisonQuery(period.year, period.month)

  const renderContent = () => {
    if (comparisonQuery.isPending) {
      return (
        <HoursPageSkeleton
          statCount={4}
          statsClassName="grid-cols-2 lg:grid-cols-4"
          label="Chargement des données contrat..."
        />
      )
    }

    if (comparisonQuery.isError) {
      const { error } = comparisonQuery
      return (
        <ErrorState
          message={
            error instanceof Error && error.message
              ? error.message
              : 'Erreur lors du chargement des données'
          }
          onRetry={() => void comparisonQuery.refetch()}
          isRetrying={comparisonQuery.isFetching}
        />
      )
    }

    const comparisons = comparisonQuery.data
    const filteredRows = buildContractRows(comparisons, search)
    const rows = sortRowsLikeVue(filteredRows, sorting, getContractSortValue)

    return (
      <div
        className={cn(
          'space-y-4 transition-opacity',
          comparisonQuery.isPlaceholderData && 'opacity-60',
        )}
      >
        <ContractStatsGrid totals={computeContractTotals(comparisons)} />

        <HoursSearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un employé..."
        />

        <div className="space-y-3 md:hidden">
          <p className="text-sm text-muted-foreground">{rows.length} employé(s)</p>
          {rows.length === 0 && <ListEmptyState icon={FileText} message="Aucun employé trouvé" />}
          {rows.map((row, index) => (
            <ContractComparisonCard key={row.user.uuid ?? index} row={row} />
          ))}
        </div>

        <ContractComparisonTable rows={rows} sorting={sorting} onSortingChange={setSorting} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MonthYearPicker
              month={period.month}
              year={period.year}
              yearOptions={getYearOptions(current.year)}
              onChange={setPeriod}
              onCurrentMonth={() => setPeriod(current)}
              disabled={comparisonQuery.isFetching}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={comparisonQuery.isFetching}
              onClick={() => void comparisonQuery.refetch()}
            >
              <RefreshCw
                className={cn('mr-2 size-4', comparisonQuery.isFetching && 'animate-spin')}
              />
              Actualiser
            </Button>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  )
}
