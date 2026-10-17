import { useState } from 'react'
import { CalendarX2, Plus } from 'lucide-react'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { StatusChips } from '@/components/shared/StatusChips'
import { Button } from '@/components/ui/button'
import { useAdminAbsencesQuery } from '@/features/absences/api/useAdminAbsencesQuery'
import type { AbsenceActionHandler } from '@/features/absences/components/admin/absenceRowActions'
import { ABSENCE_STATUS_CHIPS, employeeAbsenceParams } from '../../lib/requestParams'
import { AbsenceItem } from './AbsenceItem'
import { ListState } from './ListState'

type AbsencesTabProps = {
  userUuid: string
  onAction: AbsenceActionHandler
  onCreate: () => void
}

/** Toutes les absences de l'employé (tout l'historique), filtrables par statut. */
export function AbsencesTab({ userUuid, onAction, onCreate }: AbsencesTabProps) {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const query = useAdminAbsencesQuery(employeeAbsenceParams(userUuid, status, page))
  const absences = query.data?.absences ?? []
  const totalElements = query.data?.totalElements ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusChips
          options={ABSENCE_STATUS_CHIPS}
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(0)
          }}
          className="flex-none"
        />
        <Button onClick={onCreate}>
          <Plus className="size-4" />
          Nouvelle absence
        </Button>
      </div>

      <ListState
        isPending={query.isPending}
        error={query.error}
        isRetrying={query.isFetching}
        onRetry={() => void query.refetch()}
        isEmpty={absences.length === 0}
        emptyIcon={CalendarX2}
        emptyTitle="Aucune absence"
        emptyDescription={
          status ? 'Aucune absence avec ce statut.' : "Cet employé n'a encore aucune absence."
        }
        emptyAction={
          <Button variant="outline" onClick={onCreate}>
            <Plus className="size-4" />
            Nouvelle absence
          </Button>
        }
        loadingLabel="Chargement des absences..."
      >
        <p className="text-sm text-muted-foreground">
          {totalElements} absence{totalElements > 1 ? 's' : ''}
        </p>
        <ul className="grid items-start gap-3 3xl:grid-cols-2">
          {absences.map((absence) => (
            <AbsenceItem key={absence.uuid} absence={absence} onAction={onAction} />
          ))}
        </ul>
        <SimplePagination
          page={query.data?.currentPage ?? 0}
          totalPages={query.data?.totalPages ?? 1}
          onPageChange={setPage}
          disabled={query.isFetching}
        />
      </ListState>
    </div>
  )
}
