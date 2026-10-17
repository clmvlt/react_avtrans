import { useState } from 'react'
import { BedDouble, Plus, Trash2 } from 'lucide-react'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { formatDateLong, formatDateTime } from '@/features/absences/lib/dateFormat'
import { useAdminCouchettesQuery } from '@/features/couchettes/api/useAdminCouchettesQuery'
import type { CouchetteDTO } from '@/models'
import { HUB_PAGE_SIZE } from '../../lib/requestParams'
import { ListState } from './ListState'

type CouchettesTabProps = {
  userUuid: string
  onCreate: () => void
  onDelete: (couchette: CouchetteDTO) => void
}

/** Nuits en couchette de l'employé (POST /couchettes/admin/search), de la plus récente à la plus ancienne. */
export function CouchettesTab({ userUuid, onCreate, onDelete }: CouchettesTabProps) {
  const [page, setPage] = useState(0)
  const query = useAdminCouchettesQuery({
    userUuid,
    page,
    size: HUB_PAGE_SIZE,
    sortBy: 'date',
    sortDirection: 'desc',
  })
  const couchettes = query.data?.content ?? []
  const totalElements = query.data?.totalElements ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {query.data
            ? `${totalElements} nuit${totalElements > 1 ? 's' : ''} en couchette`
            : 'Nuits en couchette'}
        </p>
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          Nouvelle couchette
        </Button>
      </div>

      <ListState
        isPending={query.isPending}
        error={query.error}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
        isEmpty={couchettes.length === 0}
        emptyIcon={BedDouble}
        emptyTitle="Aucune couchette"
        emptyDescription="Aucune nuit en couchette enregistrée pour cet employé."
        loadingLabel="Chargement des couchettes..."
      >
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {couchettes.map((couchette) => (
            <li
              key={couchette.uuid}
              className="flex items-center gap-3 rounded-xl border bg-card p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BedDouble className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {formatDateLong(couchette.date)}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  Ajoutée le {formatDateTime(couchette.createdAt)}
                </span>
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                aria-label={`Supprimer la couchette du ${formatDateLong(couchette.date)}`}
                onClick={() => onDelete(couchette)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
        <SimplePagination
          page={query.data?.page ?? 0}
          totalPages={query.data?.totalPages ?? 1}
          onPageChange={setPage}
          disabled={query.isFetching}
        />
      </ListState>
    </div>
  )
}
