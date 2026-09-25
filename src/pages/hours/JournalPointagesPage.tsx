import { History } from 'lucide-react'
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
        <p className="text-sm text-muted-foreground">{totalElements} action(s)</p>

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
          className="pt-2"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <History className="size-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground">Journal des pointages</h1>
              <p className="text-sm text-muted-foreground">
                Ajouts, modifications et suppressions de pointages par les administrateurs
              </p>
            </div>
          </div>

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
      </main>
    </div>
  )
}
