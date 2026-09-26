import { LoaderCircle } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { useUserWorkedHoursQuery } from '@/features/user-services/api/useUserWorkedHoursQuery'
import { useHoursPeriod } from '../../hooks/useHoursPeriod'
import type { HoursPeriod } from '../../lib/hoursPeriod'
import { DayNavigator } from './DayNavigator'
import { HoursPeriodTabs } from './HoursPeriodTabs'
import { HoursStatsGrid } from './HoursStatsGrid'
import { MonthNavigator } from './MonthNavigator'
import { WeekNavigator } from './WeekNavigator'
import { YearNavigator } from './YearNavigator'

type UserHoursContentProps = {
  userUuid: string
}

/** Corps du dialog « Heures travaillées », monté à chaque ouverture (période et dates remises à zéro). */
export function UserHoursContent({ userUuid }: UserHoursContentProps) {
  const controller = useHoursPeriod()
  const { period } = controller.state
  const query = useUserWorkedHoursQuery(userUuid, controller.params, { keepPrevious: true })

  // Le Vue rechargeait à chaque clic sur une période, même déjà sélectionnée
  const selectPeriod = (next: HoursPeriod) => {
    if (next === period) void query.refetch()
    else controller.setPeriod(next)
  }

  return (
    <>
      <HoursPeriodTabs period={period} onSelect={selectPeriod} />

      {period !== 'all' && (
        <div className="rounded-lg border bg-muted/50 p-4">
          {period === 'year' && <YearNavigator controller={controller} />}
          {period === 'month' && <MonthNavigator controller={controller} />}
          {period === 'week' && <WeekNavigator controller={controller} />}
          {period === 'day' && <DayNavigator controller={controller} />}
        </div>
      )}

      <div className="relative min-h-[120px]">
        {query.isFetching && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/80">
            <LoaderCircle className="size-8 animate-spin text-primary" />
          </div>
        )}

        {query.isError ? (
          <ErrorState
            message={query.error.message || 'Erreur lors du chargement des heures'}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : query.data ? (
          <HoursStatsGrid hours={query.data} loading={query.isFetching} />
        ) : (
          !query.isFetching && (
            <div className="flex items-center justify-center py-12 text-muted-foreground italic">
              Aucune donnée disponible pour cette période
            </div>
          )
        )}
      </div>
    </>
  )
}
