import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { ExportHoursForm } from '@/features/hours/components/ExportHoursForm'
import { ExportHoursSkeleton } from '@/features/hours/components/ExportHoursSkeleton'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'

/** Export Excel des heures d'une sélection d'employés sur une période (admin). */
export default function ExportHoursPage() {
  const usersQuery = useUsersQuery()

  const renderContent = () => {
    if (usersQuery.isPending) return <ExportHoursSkeleton />

    if (usersQuery.isError) {
      const { error } = usersQuery
      return (
        <ErrorState
          message={
            error instanceof Error && error.message
              ? error.message
              : 'Erreur lors du chargement des utilisateurs'
          }
          onRetry={() => void usersQuery.refetch()}
          isRetrying={usersQuery.isFetching}
        />
      )
    }

    return <ExportHoursForm users={usersQuery.data} />
  }

  return (
    <PageContainer size="sm">
      <PageHeader
        title="Export des heures"
        description="Téléchargez au format Excel les heures des employés choisis sur une période, pour la paie (heures travaillées, heures créditées par les absences et les jours fériés)."
      />
      {renderContent()}
    </PageContainer>
  )
}
