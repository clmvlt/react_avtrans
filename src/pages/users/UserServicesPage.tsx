import { Plus } from 'lucide-react'
import { useParams } from 'react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { useServiceHistory } from '@/features/service-history/hooks/useServiceHistory'
import { useDeleteAdminServiceMutation } from '@/features/user-services/api/useAdminServiceMutations'
import { useUserActiveServiceQuery } from '@/features/user-services/api/useUserActiveServiceQuery'
import { useUserWorkedHoursQuery } from '@/features/user-services/api/useUserWorkedHoursQuery'
import { DeleteServiceDialog } from '@/features/user-services/components/DeleteServiceDialog'
import { ServiceFormDialog } from '@/features/user-services/components/ServiceFormDialog'
import { ServiceLocationDialog } from '@/features/user-services/components/ServiceLocationDialog'
import type { ServiceRowHandlers } from '@/features/user-services/components/ServiceRowActions'
import { ServicesDayList } from '@/features/user-services/components/ServicesDayList'
import { ServicesFilters } from '@/features/user-services/components/ServicesFilters'
import { UserStatusCard } from '@/features/user-services/components/UserStatusCard'
import { WorkedHoursStats } from '@/features/user-services/components/WorkedHoursStats'
import { useAdminServiceActions } from '@/features/user-services/hooks/useAdminServiceActions'
import { useServiceDialogs } from '@/features/user-services/hooks/useServiceDialogs'
import { useUserServicesList } from '@/features/user-services/hooks/useUserServicesList'
import { ABSENT_STATUS } from '@/features/user-services/lib/serviceStatus'
import { useUserQuery } from '@/features/users/api/useUserQuery'

/** Toutes les heures travaillées (même clé que la période « Toutes » du dialog des heures). */
const ALL_HOURS_PARAMS = {}

/**
 * `/users/:uuid/services` (admin) : pointages d'un employé (UserServices.vue). En-tête au nom de
 * l'employé (squelette pendant son chargement, « Employé » s'il échoue), retour vers Utilisateurs.
 * Un changement d'employé sans quitter la page (« Voir ses pointages » de l'historique) remonte
 * le contenu : filtres, page et dialogs repartent de zéro, comme le watcher du Vue.
 */
export default function UserServicesPage() {
  const { uuid = '' } = useParams()
  return <UserServicesContent key={uuid} userUuid={uuid} />
}

type UserServicesContentProps = {
  userUuid: string
}

function UserServicesContent({ userUuid }: UserServicesContentProps) {
  const userQuery = useUserQuery(userUuid)
  const statusQuery = useUserActiveServiceQuery(userUuid)
  // Échec silencieux ; pas rechargé après une action (bug B-26 reproduit)
  const hoursQuery = useUserWorkedHoursQuery(userUuid, ALL_HOURS_PARAMS)
  const list = useUserServicesList(userUuid)
  const { filters, query: servicesQuery } = list
  const dialogs = useServiceDialogs()
  const { open: openHistory } = useServiceHistory()
  const deleteMutation = useDeleteAdminServiceMutation(userUuid)

  // En chargement ou en erreur : absent, comme le Vue
  const statusInfo = statusQuery.data ?? ABSENT_STATUS
  const actions = useAdminServiceActions(userUuid, statusInfo.activeServiceUuid, () =>
    filters.load(0),
  )

  const user = userQuery.data
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''

  const handlers: ServiceRowHandlers = {
    onLocation: dialogs.openLocation,
    onHistory: openHistory,
    onEdit: dialogs.openEdit,
    onDelete: dialogs.openDelete,
  }

  const handleDelete = () => {
    const serviceUuid = dialogs.serviceToDelete?.uuid
    if (!serviceUuid) return
    // Bug B-31 reproduit : un échec est ignoré sans message (le dialog reste ouvert)
    deleteMutation.mutate(serviceUuid, {
      onSuccess: () => {
        dialogs.close()
        filters.load(0)
      },
    })
  }

  // Titre : avatar + nom ; squelette en `span` pendant le chargement (pas de `div` dans le h1)
  const title = userName ? (
    <span className="flex min-w-0 items-center gap-3">
      <UserAvatar user={user} aria-hidden />
      <span className="truncate">{userName}</span>
    </span>
  ) : userQuery.isPending ? (
    <span className="inline-block h-8 w-56 max-w-full animate-pulse rounded-md bg-accent align-middle">
      <span className="sr-only">Chargement de l&apos;employé...</span>
    </span>
  ) : (
    'Employé'
  )

  return (
    <PageContainer size="md">
      <PageHeader
        title={title}
        description="Pointages de l'employé : pointez à sa place, ajoutez ou corrigez ses services."
        back={{ to: '/users', label: 'Utilisateurs' }}
        actions={
          <Button size="sm" onClick={() => dialogs.openCreate()}>
            <Plus className="size-4" />
            Ajouter un service
          </Button>
        }
      />

      <UserStatusCard
        statusInfo={statusInfo}
        isPending={actions.isPending}
        onStartService={actions.startService}
        onStartBreak={actions.startBreak}
        onEndService={actions.endService}
        onEndBreak={actions.endBreak}
      />

      {hoursQuery.data && <WorkedHoursStats hours={hoursQuery.data} />}

      <section aria-label="Services" className="space-y-4">
        <ServicesFilters
          showFilters={filters.showFilters}
          onToggleFilters={filters.toggleFilters}
          filters={filters.draft}
          onFiltersChange={filters.setDraft}
          hasActiveFilters={filters.hasActiveFilters}
          onReset={list.reset}
          onApply={list.apply}
        />

        <ServicesDayList
          data={servicesQuery.data}
          isLoading={servicesQuery.isPending}
          isFetching={servicesQuery.isFetching}
          isError={servicesQuery.isError}
          onRetry={() => list.reload(0)}
          onPageChange={list.goToPage}
          handlers={handlers}
          onAdd={() => dialogs.openCreate()}
          onAddForDate={dialogs.openCreate}
        />
      </section>

      <ServiceFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        target={dialogs.formTarget}
        userUuid={userUuid}
        onSaved={() => filters.load(0)}
      />
      <DeleteServiceDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        service={dialogs.serviceToDelete}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
      <ServiceLocationDialog
        open={dialogs.isOpen('location')}
        onOpenChange={dialogs.onOpenChange}
        location={dialogs.location}
      />
    </PageContainer>
  )
}
