import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { Clock, RefreshCw } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { useUsersWithHoursQuery } from '@/features/hours/api/useUsersWithHoursQuery'
import { HoursPageSkeleton } from '@/features/hours/components/HoursPageSkeleton'
import { HoursSearchInput } from '@/features/hours/components/HoursSearchInput'
import { HoursStatsGrid } from '@/features/hours/components/HoursStatsGrid'
import { ListEmptyState } from '@/features/hours/components/ListEmptyState'
import { UserHoursCard } from '@/features/hours/components/UserHoursCard'
import { UsersHoursTable } from '@/features/hours/components/UsersHoursTable'
import {
  buildUserHoursRows,
  computeHoursTotals,
  filterUserHoursRows,
  getUserHoursSortValue,
} from '@/features/hours/lib/hoursFormat'
import { sortRowsLikeVue } from '@/features/hours/lib/legacySort'
import { cn } from '@/lib/utils'

/** Heures de tous les employés (admin) : totaux, recherche, cartes mobiles et tableau triable. */
export default function HeuresPage() {
  const hoursQuery = useUsersWithHoursQuery()
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])

  const renderContent = () => {
    if (hoursQuery.isPending) {
      return (
        <HoursPageSkeleton
          statCount={5}
          statsClassName="grid-cols-2 lg:grid-cols-5"
          label="Chargement des heures..."
        />
      )
    }

    if (hoursQuery.isError) {
      const { error } = hoursQuery
      return (
        <ErrorState
          message={
            error instanceof Error && error.message
              ? error.message
              : 'Erreur lors du chargement des heures'
          }
          onRetry={() => void hoursQuery.refetch()}
          isRetrying={hoursQuery.isFetching}
        />
      )
    }

    const entries = hoursQuery.data
    const filteredRows = filterUserHoursRows(buildUserHoursRows(entries), search)
    // Tri du Vue, B-19 compris (Date.parse sur les nombres d'heures)
    const rows = sortRowsLikeVue(filteredRows, sorting, getUserHoursSortValue, {
      parseDates: true,
    })

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={hoursQuery.isFetching}
            onClick={() => void hoursQuery.refetch()}
          >
            <RefreshCw className={cn('mr-2 size-4', hoursQuery.isFetching && 'animate-spin')} />
            Actualiser
          </Button>
        </div>

        <HoursStatsGrid totals={computeHoursTotals(entries)} />

        <HoursSearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un employé..."
        />

        <div className="space-y-3 md:hidden">
          <p className="text-sm text-muted-foreground">{rows.length} employé(s)</p>
          {rows.length === 0 && <ListEmptyState icon={Clock} message="Aucun employé trouvé" />}
          {rows.map((row, index) => (
            <UserHoursCard key={row.user?.uuid ?? index} row={row} />
          ))}
        </div>

        <UsersHoursTable rows={rows} sorting={sorting} onSortingChange={setSorting} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px]">{renderContent()}</div>
      </main>
    </div>
  )
}
