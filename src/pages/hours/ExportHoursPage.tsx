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
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto max-w-[1200px]">{renderContent()}</div>
      </main>
    </div>
  )
}
