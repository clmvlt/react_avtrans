import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { SearchFilters } from '@/components/shared/SearchFilters'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { getCouchettesLoadErrorMessage } from '@/features/couchettes/api/useAdminCouchettesQuery'
import { CouchetteCreateDialog } from '@/features/couchettes/components/CouchetteCreateDialog'
import { CouchetteDeleteDialog } from '@/features/couchettes/components/CouchetteDeleteDialog'
import { CouchetteDetailDialog } from '@/features/couchettes/components/CouchetteDetailDialog'
import { CouchetteMobileList } from '@/features/couchettes/components/CouchetteMobileList'
import { CouchettesSkeleton } from '@/features/couchettes/components/CouchettesSkeleton'
import { CouchettesTable } from '@/features/couchettes/components/CouchettesTable'
import { useAdminCouchettes } from '@/features/couchettes/hooks/useAdminCouchettes'
import {
  buildCouchetteFilterConfig,
  describeCouchetteFilters,
} from '@/features/couchettes/lib/couchetteFilters'
import { sortCouchettes } from '@/features/couchettes/lib/sortCouchettes'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { useDialogState } from '@/hooks/useDialogState'
import type { CouchetteDTO } from '@/models'

/**
 * /couchettes (admin, `?userUuid=` lu à l'arrivée) : recherche paginée, création, suppression.
 * En-tête et filtres restent affichés pendant le premier chargement et en cas d'erreur.
 */
export default function CouchettesPage() {
  const {
    draft,
    setDraft,
    selectedUserUuid,
    query,
    couchettes,
    pagination,
    search,
    reset,
    goToPage,
    reload,
  } = useAdminCouchettes()
  // Employés du filtre et du texte d'aide ; une erreur est ignorée, comme le Vue
  const users = useUsersQuery().data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [createOpen, setCreateOpen] = useState(false)
  const dialogs = useDialogState<'detail' | 'delete', CouchetteDTO>()

  // Tri client de la page affichée, partagé par la table et les cartes (B-19 reproduit)
  const sortedCouchettes = sortCouchettes(couchettes, sorting)

  const renderContent = () => {
    if (query.data) {
      return (
        <>
          <CouchetteMobileList
            couchettes={sortedCouchettes}
            totalElements={pagination.totalElements}
            onDetail={(couchette) => dialogs.open('detail', couchette)}
            onDelete={(couchette) => dialogs.open('delete', couchette)}
          />
          <CouchettesTable
            couchettes={sortedCouchettes}
            totalElements={pagination.totalElements}
            sorting={sorting}
            onSortingChange={setSorting}
            onDetail={(couchette) => dialogs.open('detail', couchette)}
            onDelete={(couchette) => dialogs.open('delete', couchette)}
          />
          <SimplePagination
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={goToPage}
          />
        </>
      )
    }

    // Erreur de chargement : filtres conservés, avec « Réessayer » (le Vue remplaçait tout)
    if (query.isError) {
      return (
        <ErrorState
          message={getCouchettesLoadErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isRefetching}
        />
      )
    }

    return <CouchettesSkeleton />
  }

  return (
    <PageContainer>
      <PageHeader
        title="Couchettes"
        description="Les nuits en couchette déclarées par les chauffeurs."
        actions={
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Nouvelle couchette
          </Button>
        }
      />

      <div className="space-y-4">
        <SearchFilters
          value={draft}
          onChange={setDraft}
          filters={buildCouchetteFilterConfig(users, selectedUserUuid)}
          loading={query.isFetching}
          columns={3}
          hint={describeCouchetteFilters(draft, users)}
          onSearch={search}
          onReset={reset}
        />

        {renderContent()}
      </div>

      <CouchetteCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => reload(0)}
      />
      <CouchetteDetailDialog
        open={dialogs.isOpen('detail')}
        onOpenChange={dialogs.onOpenChange}
        couchette={dialogs.item}
        onDelete={(couchette) => dialogs.open('delete', couchette)}
      />
      <CouchetteDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        couchette={dialogs.item}
        onDeleted={() => reload(pagination.currentPage)}
      />
    </PageContainer>
  )
}
