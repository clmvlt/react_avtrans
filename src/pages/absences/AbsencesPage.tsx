import { Plus } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageTabs } from '@/components/layout/PageTabs'
import { ErrorState } from '@/components/shared/ErrorState'
import { SearchFilters, type FilterConfig } from '@/components/shared/SearchFilters'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAbsenceTypesQuery } from '@/features/absences/api/useAbsenceTypesQuery'
import { useAdminAbsencesQuery } from '@/features/absences/api/useAdminAbsencesQuery'
import {
  AbsenceDialogs,
  type AbsenceDialogType,
} from '@/features/absences/components/admin/AbsenceDialogs'
import { AbsenceMobileList } from '@/features/absences/components/admin/AbsenceMobileList'
import { AbsencesDataTable } from '@/features/absences/components/admin/AbsencesDataTable'
import type { AbsenceAction } from '@/features/absences/components/admin/absenceRowActions'
import { useAdminAbsenceFilters } from '@/features/absences/hooks/useAdminAbsenceFilters'
import {
  ADMIN_ABSENCE_STATUS_OPTIONS,
  adminAbsenceFiltersHint,
  filterText,
} from '@/features/absences/lib/absenceFilters'
import { ABSENCE_TABS } from '@/features/absences/lib/absenceTabs'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { useDialogState } from '@/hooks/useDialogState'
import type { AbsenceDTO } from '@/models'
import { selectableUsers } from '@/utils/userVisibility'

const ACTION_DIALOG: Record<AbsenceAction, AbsenceDialogType> = {
  approve: 'approve',
  reject: 'reject',
  details: 'detail',
  edit: 'edit',
  hours: 'hours',
  delete: 'delete',
}

/** Gestion des absences (admin) : filtres, liste paginée, actions par ligne (port d'`Absences.vue`). */
export default function AbsencesPage() {
  const { filters, setFilters, params, loadPage, apply, reset } = useAdminAbsenceFilters()
  const absencesQuery = useAdminAbsencesQuery(params)
  const { data: users = [] } = useUsersQuery()
  const { data: absenceTypes = [] } = useAbsenceTypesQuery()
  const dialogs = useDialogState<AbsenceDialogType, AbsenceDTO>()

  const absences = absencesQuery.data?.absences || []
  const currentPage = absencesQuery.data?.currentPage || 0
  const totalPages = absencesQuery.data?.totalPages || 1
  const totalElements = absencesQuery.data?.totalElements || 0

  const filterConfig: FilterConfig[] = [
    {
      key: 'userUuid',
      label: 'Employé',
      type: 'select',
      placeholder: 'Tous les employés',
      // Visibles uniquement, plus l'employé déjà sélectionné (même masqué) pour garder son nom
      options: selectableUsers(users, [filterText(filters.userUuid)])
        .filter((user) => user.uuid && user.firstName)
        .map((user) => ({ value: user.uuid!, label: `${user.firstName} ${user.lastName}` })),
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: ADMIN_ABSENCE_STATUS_OPTIONS,
    },
    {
      key: 'absenceTypeUuid',
      label: "Type d'absence",
      type: 'select',
      placeholder: 'Tous les types',
      options: absenceTypes
        .filter((type) => type.uuid && type.name)
        .map((type) => ({ value: type.uuid!, label: type.name! })),
    },
    { key: 'startDate', label: 'Date de début', type: 'date' },
    { key: 'endDate', label: 'Date de fin', type: 'date' },
  ]

  const handleAction = (action: AbsenceAction, absence: AbsenceDTO) =>
    dialogs.open(ACTION_DIALOG[action], absence)

  return (
    <PageContainer>
      <PageHeader
        title="Absences"
        description="Validez ou refusez les demandes et saisissez les absences des employés."
        actions={
          <Button size="sm" onClick={() => dialogs.open('create')}>
            <Plus className="size-4" />
            Nouvelle absence
          </Button>
        }
      >
        <PageTabs tabs={ABSENCE_TABS} />
      </PageHeader>

      <div className="space-y-4">
        <SearchFilters
          value={filters}
          onChange={setFilters}
          filters={filterConfig}
          loading={absencesQuery.isFetching}
          columns={5}
          hint={adminAbsenceFiltersHint(filters, users, absenceTypes)}
          onSearch={apply}
          onReset={reset}
        />

        {absencesQuery.isPending ? (
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">Chargement des absences...</span>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : absencesQuery.isError ? (
          <ErrorState
            message={errorMessage(absencesQuery.error, 'Erreur lors du chargement des absences')}
            onRetry={() => void absencesQuery.refetch()}
            isRetrying={absencesQuery.isRefetching}
          />
        ) : (
          <>
            <AbsenceMobileList
              absences={absences}
              totalElements={totalElements}
              onAction={handleAction}
            />
            <AbsencesDataTable
              absences={absences}
              totalElements={totalElements}
              onAction={handleAction}
            />
            <SimplePagination page={currentPage} totalPages={totalPages} onPageChange={loadPage} />
          </>
        )}
      </div>

      <AbsenceDialogs dialogs={dialogs} onChanged={() => loadPage(currentPage)} />
    </PageContainer>
  )
}
