import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/shared/ErrorState'
import { SearchFilters, type FilterConfig } from '@/components/shared/SearchFilters'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useAdminAcomptesQuery } from '@/features/acomptes/api/useAdminAcomptesQuery'
import { useToggleAcomptePaidMutation } from '@/features/acomptes/api/useToggleAcomptePaidMutation'
import {
  AcompteDialogs,
  type AcompteDialogType,
} from '@/features/acomptes/components/admin/AcompteDialogs'
import { AcompteMobileList } from '@/features/acomptes/components/admin/AcompteMobileList'
import { AcomptesDataTable } from '@/features/acomptes/components/admin/AcomptesDataTable'
import type { AcompteAction } from '@/features/acomptes/components/admin/acompteRowActions'
import { useAdminAcompteFilters } from '@/features/acomptes/hooks/useAdminAcompteFilters'
import {
  ADMIN_ACOMPTE_STATUS_OPTIONS,
  adminAcompteFiltersHint,
} from '@/features/acomptes/lib/acompteFilters'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { useDialogState } from '@/hooks/useDialogState'
import type { AcompteDTO } from '@/models'
import { selectableUsers } from '@/utils/userVisibility'

const ACTION_DIALOG: Record<Exclude<AcompteAction, 'togglePayment'>, AcompteDialogType> = {
  approve: 'approve',
  reject: 'reject',
  details: 'detail',
  delete: 'delete',
}

/** Gestion des acomptes (admin) : filtres, liste paginée, actions par ligne (port d'`Acomptes.vue`). */
export default function AcomptesPage() {
  const { filters, setFilters, params, loadPage, apply, reset } = useAdminAcompteFilters()
  const acomptesQuery = useAdminAcomptesQuery(params)
  const togglePaid = useToggleAcomptePaidMutation(params)
  const { data: users = [] } = useUsersQuery()
  const dialogs = useDialogState<AcompteDialogType, AcompteDTO>()

  const acomptes = acomptesQuery.data?.acomptes || []
  const currentPage = acomptesQuery.data?.currentPage || 0
  const totalPages = acomptesQuery.data?.totalPages || 1
  const totalElements = acomptesQuery.data?.totalElements || 0

  const selectedUserUuid = typeof filters.userUuid === 'string' ? filters.userUuid : ''
  const filterConfig: FilterConfig[] = [
    {
      key: 'userUuid',
      label: 'Employé',
      type: 'select',
      placeholder: 'Tous les employés',
      // Visibles uniquement, plus l'employé déjà sélectionné (même masqué) pour garder son nom
      options: selectableUsers(users, [selectedUserUuid])
        .filter((user) => user.uuid && user.firstName)
        .map((user) => ({ value: user.uuid!, label: `${user.firstName} ${user.lastName}` })),
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'select',
      placeholder: 'Tous les statuts',
      options: ADMIN_ACOMPTE_STATUS_OPTIONS,
    },
    { key: 'montantMin', label: 'Montant min', type: 'number', placeholder: 'Min €' },
    { key: 'montantMax', label: 'Montant max', type: 'number', placeholder: 'Max €' },
    { key: 'startDate', label: 'Date de début', type: 'date' },
    { key: 'endDate', label: 'Date de fin', type: 'date' },
  ]

  const isPaymentPending = (acompte: AcompteDTO) =>
    togglePaid.isPending && togglePaid.variables?.uuid === acompte.uuid

  const handleAction = (action: AcompteAction, acompte: AcompteDTO) => {
    if (action !== 'togglePayment') {
      dialogs.open(ACTION_DIALOG[action], acompte)
      return
    }
    if (!acompte.uuid) return
    // Mise à jour optimiste ; en cas d'échec, retour à l'état précédent et toast (sans toucher la page)
    togglePaid.mutate(
      { uuid: acompte.uuid, isPaid: !acompte.isPaid },
      {
        onError: (err) =>
          toast.error('Erreur', {
            description: errorMessage(err, 'Erreur lors de la mise à jour du statut de paiement'),
          }),
      },
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Acomptes"
        description="Validez les demandes d'avance sur salaire et suivez les paiements."
        actions={
          <Button size="sm" onClick={() => dialogs.open('create')}>
            <Plus className="size-4" />
            Nouvel acompte
          </Button>
        }
      />

      <div className="space-y-4">
        <SearchFilters
          value={filters}
          onChange={setFilters}
          filters={filterConfig}
          loading={acomptesQuery.isFetching}
          columns={5}
          hint={adminAcompteFiltersHint(filters, users)}
          onSearch={apply}
          onReset={reset}
        />

        {acomptesQuery.isPending ? (
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">Chargement des acomptes...</span>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : acomptesQuery.isError ? (
          <ErrorState
            message={errorMessage(acomptesQuery.error, 'Erreur lors du chargement des acomptes')}
            onRetry={() => void acomptesQuery.refetch()}
            isRetrying={acomptesQuery.isRefetching}
          />
        ) : (
          <>
            <AcompteMobileList
              acomptes={acomptes}
              totalElements={totalElements}
              onAction={handleAction}
              isPaymentPending={isPaymentPending}
            />
            <AcomptesDataTable
              acomptes={acomptes}
              totalElements={totalElements}
              onAction={handleAction}
              isPaymentPending={isPaymentPending}
            />
            <SimplePagination page={currentPage} totalPages={totalPages} onPageChange={loadPage} />
          </>
        )}
      </div>

      <AcompteDialogs
        dialogs={dialogs}
        onCreated={() => loadPage(0)}
        onChanged={() => loadPage(currentPage)}
      />
    </PageContainer>
  )
}
