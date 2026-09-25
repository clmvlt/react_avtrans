import { useState } from 'react'
import { ClipboardList, Filter } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { useServiceHistoryQuery } from '../api/useServiceHistoryQuery'
import { groupHistoryByDay } from '../lib/groupHistoryByDay'
import { HistoryDayItem } from './HistoryDayItem'

type ServiceHistorySectionProps = {
  query: ReturnType<typeof useServiceHistoryQuery>
  page: number
  onPageChange: (page: number) => void
  activeFilterCount: number
  onOpenFilters: () => void
  onResetFilters: () => void
}

/** Jours dépliés, valables pour une réponse donnée de l'API (`dataUpdatedAt`). */
type OpenDaysState = { dataUpdatedAt: number; days: string[] }

/** Colonne « Historique » : bouton Filtres, jours en accordéon, pagination. */
export function ServiceHistorySection({
  query,
  page,
  onPageChange,
  activeFilterCount,
  onOpenFilters,
  onResetFilters,
}: ServiceHistorySectionProps) {
  const [openDays, setOpenDays] = useState<OpenDaysState | null>(null)
  const days = groupHistoryByDay(query.data?.content ?? [])
  // Comme le Vue : après chaque chargement de l'historique, seul le jour le plus récent est déplié
  const openValue =
    openDays?.dataUpdatedAt === query.dataUpdatedAt ? openDays.days : days[0] ? [days[0].date] : []

  const renderContent = () => {
    if (query.isPending) {
      return (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )
    }
    if (query.isLoadingError) {
      return (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : "Erreur lors du chargement de l'historique"
          }
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      )
    }
    if (days.length === 0) {
      return (
        <Empty className="gap-0 rounded-2xl border border-solid bg-card p-8 md:p-8">
          <EmptyMedia className="mb-3">
            <ClipboardList className="size-9 text-muted-foreground/70" />
          </EmptyMedia>
          <EmptyDescription className="text-sm">Aucun service trouvé</EmptyDescription>
          {activeFilterCount > 0 && (
            <EmptyContent>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={onResetFilters}
              >
                Réinitialiser les filtres
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )
    }
    return (
      <>
        <Accordion
          type="multiple"
          value={openValue}
          onValueChange={(value) =>
            setOpenDays({ dataUpdatedAt: query.dataUpdatedAt, days: value })
          }
          className="flex flex-col gap-2"
        >
          {days.map((day) => (
            <HistoryDayItem key={day.date} day={day} />
          ))}
        </Accordion>
        <SimplePagination
          variant="card"
          page={page}
          totalPages={query.data.totalPages}
          totalElements={query.data.totalElements}
          onPageChange={onPageChange}
        />
      </>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Historique</h2>
        <Button
          type="button"
          variant={activeFilterCount > 0 ? 'default' : 'outline'}
          size="sm"
          onClick={onOpenFilters}
        >
          <Filter className="size-4" />
          Filtres
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-background/20 text-[11px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
      {renderContent()}
    </section>
  )
}
