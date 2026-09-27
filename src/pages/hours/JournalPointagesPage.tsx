import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { useServiceModificationsSearchQuery } from '@/features/service-history/api/useServiceModificationsSearchQuery'
import { JournalFilters } from '@/features/service-history/components/JournalFilters'
import { JournalSkeleton } from '@/features/service-history/components/JournalSkeleton'
import { ServiceModificationList } from '@/features/service-history/components/ServiceModificationList'
import { ServiceModificationsTable } from '@/features/service-history/components/ServiceModificationsTable'
import { useJournalFilters } from '@/features/service-history/hooks/useJournalFilters'
import { useServiceHistory } from '@/features/service-history/hooks/useServiceHistory'
import { getJournalEmptyText } from '@/features/service-history/lib/journalFilters'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { cn } from '@/lib/utils'
import type { UserDTO } from '@/models'

const NO_USERS: UserDTO[] = []

/**
 * Journal des actions des administrateurs sur les pointages (admin). Un clic sur une entrée ouvre
 * l'historique global du pointage.
 */
export default function JournalPointagesPage() {
  const { open: openHistory } = useServiceHistory()
  // Options des filtres : un échec est sans effet visible (console seule dans le Vue)
  const users = useUsersQuery().data ?? NO_USERS
  const journal = useJournalFilters()
  const journalQuery = useServiceModificationsSearchQuery(journal.request)
  // Recherche après le premier chargement : filtres désactivés, résultats estompés
  const searchLoading = journalQuery.isFetching && !journalQuery.isPending
  const emptyText = getJournalEmptyText(journal.draft)

  const renderContent = () => {
    if (journalQuery.isPending) return <JournalSkeleton />

    if (journalQuery.isError) {
      const { error } = journalQuery
      return (
        <ErrorState
          message={
            error instanceof Error && error.message
              ? error.message
              : 'Erreur lors du chargement du journal'
          }
          // Comme le Vue : relance avec les filtres saisis, sur la page courante
          onRetry={() => journal.search(journal.request.page ?? 0)}
          isRetrying={searchLoading}
        />
      )
    }

    const { modifications, page, totalPages, totalElements } = journalQuery.data

    return (
      <div className={cn('space-y-4 transition-opacity', searchLoading && 'opacity-60')}>
        <p className="text-sm text-muted-foreground">
          {totalElements} action(s)
          {/* Les lignes (et les cartes) sont cliquables : on le dit */}
          {modifications.length > 0 && (
            <>
              <span className="md:hidden"> · touchez une carte pour voir son historique</span>
              <span className="max-md:hidden">
                {' '}
                · cliquez sur une ligne pour voir l&apos;historique du pointage
              </span>
            </>
          )}
        </p>

        <ServiceModificationList
          modifications={modifications}
          emptyText={emptyText}
          onOpen={openHistory}
        />
        <ServiceModificationsTable
          modifications={modifications}
          emptyText={emptyText}
          onOpen={openHistory}
        />

        <SimplePagination
          page={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => journal.search(nextPage)}
          disabled={searchLoading}
        />
      </div>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Journal des pointages"
        description="Les ajouts, modifications et suppressions de pointages faits par les administrateurs."
      />

      <div className="space-y-4">
        <JournalFilters
          value={journal.draft}
          onChange={journal.setDraft}
          users={users}
          loading={searchLoading}
          onSearch={() => journal.search(0)}
          onReset={journal.reset}
        />

        {renderContent()}
      </div>
    </PageContainer>
  )
}
