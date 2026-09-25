import { CalendarX2 } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { useAbsenceTypesQuery } from '@/features/absences/api/useAbsenceTypesQuery'
import { usePlanningQuery } from '@/features/planning/api/usePlanningQuery'
import { AbsenceDetailDialog } from '@/features/planning/components/AbsenceDetailDialog'
import { PlanningExportMenu } from '@/features/planning/components/PlanningExportMenu'
import { PlanningGrid } from '@/features/planning/components/PlanningGrid'
import { PlanningSkeleton } from '@/features/planning/components/PlanningSkeleton'
import { PlanningToolbar } from '@/features/planning/components/PlanningToolbar'
import { useAbsenceDetailDialog } from '@/features/planning/hooks/useAbsenceDetailDialog'
import { usePlanningExport } from '@/features/planning/hooks/usePlanningExport'
import { usePlanningPeriod } from '@/features/planning/hooks/usePlanningPeriod'
import { buildPlanningDates, getPeriodLabel } from '@/features/planning/lib/planningDates'
import type { AbsenceTypeDTO } from '@/models'

const NO_ABSENCE_TYPES: AbsenceTypeDTO[] = []

/** Planning des absences (admin) : semaine, mois ou plage personnalisée, export PDF / PNG. */
export default function PlanningPage() {
  const period = usePlanningPeriod()
  const planningQuery = usePlanningQuery(period.params)
  // Erreur de chargement des types ignorée (légende et export sans types), comme le Vue
  const absenceTypes = useAbsenceTypesQuery().data ?? NO_ABSENCE_TYPES
  const absenceDialog = useAbsenceDetailDialog()
  const { isExporting, exportPlanning } = usePlanningExport()

  const planning = planningQuery.data
  const users = planning?.users ?? []
  const dates = buildPlanningDates(planning?.startDate ?? '', planning?.endDate ?? '')
  const periodLabel = getPeriodLabel({
    ...period.period,
    startDate: planning?.startDate,
    endDate: planning?.endDate,
  })

  const renderContent = () => {
    if (planningQuery.isPending) return <PlanningSkeleton />

    if (planningQuery.isError) {
      const { error } = planningQuery
      return (
        <ErrorState
          message={
            error instanceof Error && error.message
              ? error.message
              : 'Erreur lors du chargement du planning'
          }
          onRetry={() => void planningQuery.refetch()}
          isRetrying={planningQuery.isFetching}
        />
      )
    }

    if (users.length === 0) {
      return (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia className="size-16 rounded-full bg-muted">
              <CalendarX2 className="size-7 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-semibold text-foreground">
              Aucun utilisateur
            </EmptyTitle>
            <EmptyDescription className="text-base">
              Aucun employé n&apos;est disponible pour cette période.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }

    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {users.length} employé{users.length > 1 ? 's' : ''} · {dates.length} jours
          </span>
          <PlanningExportMenu
            isExporting={isExporting}
            disabled={planningQuery.isPlaceholderData}
            onExport={(format) =>
              void exportPlanning(format, {
                users,
                dates,
                absenceTypes,
                startDate: planning?.startDate ?? '',
                endDate: planning?.endDate ?? '',
              })
            }
          />
        </div>
        <PlanningGrid
          users={users}
          dates={dates}
          absenceTypes={absenceTypes}
          onAbsenceClick={absenceDialog.openAbsence}
          isStale={planningQuery.isPlaceholderData}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <PlanningToolbar period={period} periodLabel={periodLabel} />
      <main className="px-4 py-4 md:px-6 md:py-6">{renderContent()}</main>
      <AbsenceDetailDialog controller={absenceDialog} />
    </div>
  )
}
