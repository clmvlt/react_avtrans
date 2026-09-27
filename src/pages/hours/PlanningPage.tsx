import { CalendarX2 } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
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

/**
 * Planning des absences (admin) : semaine, mois ou plage personnalisée, export PDF / PNG.
 * À la demande du propriétaire, la page n'a pas d'en-tête visible (titre dans le fil d'Ariane et
 * pour les lecteurs d'écran) : la barre d'outils porte l'export et la grille prend toute la page.
 * L'export n'est actif que lorsque la grille de la période choisie est affichée. La grille tient
 * dans la fenêtre et défile à l'intérieur ; jours fériés et jours décomptés suivent les règles de
 * l'API (D8).
 */
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
  // Même condition d'affichage que la grille (le bouton était dans la grille dans le Vue)
  const hasGrid = planningQuery.isSuccess && users.length > 0
  const holidayCount = dates.filter((date) => date.isHoliday).length
  const summary = hasGrid
    ? [
        `${users.length} employé${users.length > 1 ? 's' : ''}`,
        `${dates.length} jours`,
        holidayCount > 0 && `${holidayCount} férié${holidayCount > 1 ? 's' : ''}`,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined

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
        <Empty className="rounded-xl border py-16 md:py-16">
          <EmptyHeader>
            <EmptyMedia className="size-16 rounded-full bg-muted">
              <CalendarX2 className="size-7 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-semibold text-foreground">
              Aucun utilisateur
            </EmptyTitle>
            <EmptyDescription>
              Aucun employé n&apos;est disponible pour cette période.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }

    return (
      <PlanningGrid
        users={users}
        dates={dates}
        absenceTypes={absenceTypes}
        onAbsenceClick={absenceDialog.openAbsence}
        isStale={planningQuery.isPlaceholderData}
      />
    )
  }

  return (
    <PageContainer size="full" className="gap-3 py-3 md:py-4">
      <h1 className="sr-only">Planning</h1>
      <PlanningToolbar
        period={period}
        periodLabel={periodLabel}
        summary={summary}
        actions={
          <PlanningExportMenu
            isExporting={isExporting}
            disabled={!hasGrid || planningQuery.isPlaceholderData}
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
        }
      />
      {renderContent()}

      <AbsenceDetailDialog controller={absenceDialog} />
    </PageContainer>
  )
}
