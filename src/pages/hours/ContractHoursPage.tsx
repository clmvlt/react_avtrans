import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { FileText, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
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
  shouldShowForecast,
} from '@/features/hours/lib/contractFormat'
import { sortRowsLikeVue } from '@/features/hours/lib/legacySort'
import { cn } from '@/lib/utils'

/**
 * Heures contrat / heures effectuées par employé pour un mois (admin). Le choix du mois, sous
 * l'en-tête, reste disponible pendant le chargement et après une erreur (le Vue le masquait, sans
 * « Réessayer » : corrigé par construction, MIGRATION.md 8.1). D10 : réalisation prévue à la fin
 * du mois, pour le mois en cours et les mois à venir.
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

    const { comparisons, joursOuvresRestants } = comparisonQuery.data
    const filteredRows = buildContractRows(comparisons, search)
    const rows = sortRowsLikeVue(filteredRows, sorting, getContractSortValue)
    const forecast = shouldShowForecast(period, current, comparisons)
      ? { joursOuvresRestantsMois: joursOuvresRestants }
      : null

    return (
      <div
        className={cn(
          'space-y-6 transition-opacity',
          comparisonQuery.isPlaceholderData && 'opacity-60',
        )}
      >
        <ContractStatsGrid
          totals={computeContractTotals(comparisons)}
          joursOuvresRestants={forecast ? joursOuvresRestants : null}
        />

        <div className="space-y-4">
          <HoursSearchInput
            className="max-w-md"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un employé..."
            aria-label="Rechercher un employé"
          />

          <div className="space-y-3 md:hidden">
            <p className="text-sm text-muted-foreground">{rows.length} employé(s)</p>
            {rows.length === 0 && <ListEmptyState icon={FileText} message="Aucun employé trouvé" />}
            {rows.map((row, index) => (
              <ContractComparisonCard key={row.user.uuid ?? index} row={row} forecast={forecast} />
            ))}
          </div>

          <ContractComparisonTable
            rows={rows}
            forecast={forecast}
            sorting={sorting}
            onSortingChange={setSorting}
          />
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Heures contrat"
        description="Comparez les heures travaillées et créditées (absences, jours fériés) aux heures du contrat, mois par mois."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={comparisonQuery.isFetching}
            onClick={() => void comparisonQuery.refetch()}
          >
            <RefreshCw className={cn('size-4', comparisonQuery.isFetching && 'animate-spin')} />
            Actualiser
          </Button>
        }
      >
        <MonthYearPicker
          month={period.month}
          year={period.year}
          yearOptions={getYearOptions(current.year)}
          onChange={setPeriod}
          onCurrentMonth={() => setPeriod(current)}
          disabled={comparisonQuery.isFetching}
        />
      </PageHeader>

      {renderContent()}
    </PageContainer>
  )
}
