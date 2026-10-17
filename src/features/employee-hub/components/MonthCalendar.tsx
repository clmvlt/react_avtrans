import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserContractComparisonQuery } from '@/features/hours/api/useUserContractComparisonQuery'
import { formatContractHours, formatJours } from '@/features/hours/lib/contractFormat'
import { usePlanningQuery } from '@/features/planning/api/usePlanningQuery'
import { buildAbsenceDayMap } from '@/features/planning/lib/absenceDays'
import { buildPlanningDates } from '@/features/planning/lib/planningDates'
import { useUserServicesRangeQuery } from '@/features/user-services/api/useUserServicesRangeQuery'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isLineRunning, liveContractComparison } from '@/lib/liveCounter'
import { groupLinesByServiceDay, hasRunningLine, sumWorkSeconds } from '@/lib/serviceLines'
import {
  WEEKDAY_LABELS,
  chunkWeeks,
  currentYearMonth,
  formatMonthTitle,
  isSameMonth,
  monthGridRange,
  monthKey,
  shiftMonth,
} from '../lib/monthCalendar'
import { CalendarDayCell } from './CalendarDayCell'
import { HubCard } from './HubCard'

type MonthCalendarProps = {
  userUuid: string
  userName: string
  /** Clic sur un jour : ses pointages */
  onSelectDay: (dateKey: string) => void
}

/**
 * Mois de l'employé d'un coup d'œil : heures nettes de chaque jour (services de ce jour, temps
 * net de l'API), absences aux couleurs de leur type (hachurées en attente), fériés et week-ends.
 * En tête, le total du mois et les jours d'absence selon la comparaison au contrat.
 */
export function MonthCalendar({ userUuid, userName, onSelectDay }: MonthCalendarProps) {
  const [period, setPeriod] = useState(currentYearMonth)
  const isCurrent = isSameMonth(period, currentYearMonth())
  const { startDate, endDate } = monthGridRange(period)
  const dates = buildPlanningDates(startDate, endDate)
  const shownMonth = monthKey(period)

  const servicesQuery = useUserServicesRangeQuery(userUuid, startDate, endDate)
  const planningQuery = usePlanningQuery({ periodType: 'custom', startDate, endDate })
  const contractQuery = useUserContractComparisonQuery(userUuid, period.year, period.month)

  const lines = servicesQuery.data?.lines ?? []
  const elapsed = useLiveElapsed(servicesQuery.data?.receivedAt, hasRunningLine(lines))
  const linesByDay = groupLinesByServiceDay(lines)
  const absences = planningQuery.data?.users.find((user) => user.uuid === userUuid)?.absences
  const absenceDays = buildAbsenceDayMap(absences, dates)

  const contract = contractQuery.data
  const contractElapsed = useLiveElapsed(contract?.receivedAt, contract?.row?.enCours === true)
  const row = contract?.row ? liveContractComparison(contract.row, contractElapsed) : null

  const isLoading = servicesQuery.isPending
  const isRefreshing =
    (servicesQuery.isPlaceholderData || planningQuery.isPlaceholderData) &&
    (servicesQuery.isFetching || planningQuery.isFetching)

  return (
    <HubCard
      title={formatMonthTitle(period)}
      icon={CalendarDays}
      description={
        row ? (
          <>
            <span className="font-medium text-foreground">
              {formatContractHours(row.heuresEffectuees)}
            </span>{' '}
            travaillées
            {row.joursAbsence > 0 && <> · {formatJours(row.joursAbsence)} j d&apos;absence</>}
            {row.heureContrat != null && <> · contrat {formatContractHours(row.heureContrat)}</>}
          </>
        ) : (
          'Cliquez sur un jour pour voir ses pointages'
        )
      }
      actions={
        <>
          {isRefreshing && (
            <LoaderCircle className="mr-1 size-4 animate-spin text-muted-foreground" />
          )}
          {!isCurrent && (
            <Button
              variant="outline"
              size="sm"
              className="max-sm:hidden"
              onClick={() => setPeriod(currentYearMonth())}
            >
              Ce mois-ci
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mois précédent"
            onClick={() => setPeriod((value) => shiftMonth(value, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mois suivant"
            onClick={() => setPeriod((value) => shiftMonth(value, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </>
      }
    >
      {servicesQuery.isError ? (
        <ErrorState
          message="Erreur lors du chargement des pointages du mois"
          onRetry={() => void servicesQuery.refetch()}
          isRetrying={servicesQuery.isFetching}
        />
      ) : (
        <div className="flex flex-col gap-1 sm:gap-1.5" aria-busy={isLoading}>
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-center text-[11px] font-medium text-muted-foreground uppercase sm:text-xs"
              >
                {label}
              </span>
            ))}
          </div>
          {chunkWeeks(dates).map((week) => (
            <div key={week[0]?.dateStr} className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {week.map((date) =>
                isLoading ? (
                  <Skeleton key={date.dateStr} className="min-h-16 rounded-lg sm:min-h-24" />
                ) : (
                  <CalendarDayCell
                    key={date.dateStr}
                    date={date}
                    inMonth={date.monthKey === shownMonth}
                    workSeconds={sumWorkSeconds(linesByDay.get(date.dateStr) ?? [], elapsed)}
                    running={(linesByDay.get(date.dateStr) ?? []).some(isLineRunning)}
                    absence={absenceDays.get(date.dateStr)}
                    userName={userName}
                    onSelect={onSelectDay}
                  />
                ),
              )}
            </div>
          ))}
          {planningQuery.isError && (
            <p className="text-xs text-destructive">
              Les absences n&apos;ont pas pu être chargées.
            </p>
          )}
          <CalendarLegend />
        </div>
      )}
    </HubCard>
  )
}

/** Légende discrète sous la grille. */
function CalendarLegend() {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-1 w-5 rounded-full bg-primary" />
        Heures pointées (8 h = barre pleine)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-5 rounded-sm border-l-[3px] border-l-muted-foreground bg-muted" />
        Absence
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-5 rounded-sm border-l-[3px] border-l-muted-foreground bg-[repeating-linear-gradient(135deg,var(--muted)_0_3px,transparent_3px_6px)]" />
        En attente
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-5 rounded-sm border bg-hatch-holiday" />
        Férié
      </span>
    </div>
  )
}
