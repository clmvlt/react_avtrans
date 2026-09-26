import { ErrorState } from '@/components/shared/ErrorState'
import { useUsersLastVehiclesQuery } from '@/features/users/api/useUsersLastVehiclesQuery'
import { useDeleteUserMutation } from '@/features/users/api/useDeleteUserMutation'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog'
import { PendingActivationSection } from '@/features/users/components/PendingActivationSection'
import { UserEditDialog } from '@/features/users/components/UserEditDialog'
import { UserEmailDialog } from '@/features/users/components/UserEmailDialog'
import { UserHoursDialog } from '@/features/users/components/UserHoursDialog'
import { UserMobileList } from '@/features/users/components/UserMobileList'
import { UsersDataTable } from '@/features/users/components/UsersDataTable'
import { UsersPageSkeleton } from '@/features/users/components/UsersPageSkeleton'
import { UsersToolbar } from '@/features/users/components/UsersToolbar'
import { useActivateUser } from '@/features/users/hooks/useActivateUser'
import { useUserActions, type UserDialogType } from '@/features/users/hooks/useUserActions'
import { useUsersFilters } from '@/features/users/hooks/useUsersFilters'
import { errorMessage, notifyError, notifySuccess } from '@/features/users/lib/messages'
import { isPendingActivation } from '@/features/users/lib/pendingActivation'
import { useDialogState } from '@/hooks/useDialogState'
import type { UserDTO } from '@/models'

/** `/users` (admin) : administration de tous les comptes, masqués compris (Users.vue). */
export default function UsersPage() {
  const usersQuery = useUsersQuery()
  // Chargé en parallèle ; son échec est silencieux (colonne « — »)
  const lastVehiclesQuery = useUsersLastVehiclesQuery()
  const users = usersQuery.data ?? []

  const filters = useUsersFilters(users)
  const dialogs = useDialogState<UserDialogType, UserDTO>()
  const actions = useUserActions(dialogs.open)
  const { activate, activatingUuid } = useActivateUser()
  const deleteMutation = useDeleteUserMutation()

  const handleDelete = () => {
    const uuid = dialogs.item?.uuid
    if (!uuid) return
    deleteMutation.mutate(uuid, {
      onSuccess: () => {
        notifySuccess('Utilisateur supprimé avec succès', 'Succès')
        dialogs.close()
      },
      onError: (error) =>
        notifyError(errorMessage(error, 'Erreur lors de la suppression'), 'Erreur'),
    })
  }

  // Comme le Promise.all du Vue : la page s'affiche quand les deux requêtes ont répondu
  const isLoading = usersQuery.isPending || lastVehiclesQuery.isPending

  return (
    <div className="min-h-screen bg-background">
      <main className="px-4 py-4 md:px-6 md:py-6">
        <div className="mx-auto max-w-[1400px]">
          {isLoading ? (
            <UsersPageSkeleton />
          ) : usersQuery.isError ? (
            <ErrorState
              message={usersQuery.error.message || 'Erreur lors du chargement des utilisateurs'}
              onRetry={() => void usersQuery.refetch()}
              isRetrying={usersQuery.isFetching}
            />
          ) : (
            <div className="space-y-4">
              <PendingActivationSection
                users={users.filter((user) => isPendingActivation(user))}
                activatingUuid={activatingUuid}
                onActivate={activate}
              />
              <UsersToolbar
                search={filters.search}
                onSearchChange={filters.setSearch}
                showHidden={filters.showHidden}
                onShowHiddenChange={filters.setShowHidden}
                hiddenCount={filters.hiddenCount}
              />
              <UserMobileList
                users={filters.visibleUsers}
                lastVehicles={lastVehiclesQuery.data}
                actions={actions}
              />
              <UsersDataTable
                users={filters.visibleUsers}
                lastVehicles={lastVehiclesQuery.data}
                actions={actions}
                sorting={filters.sorting}
                onSortingChange={filters.setSorting}
              />
            </div>
          )}
        </div>
      </main>

      <DeleteUserDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        user={dialogs.item}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
      <UserEditDialog
        open={dialogs.isOpen('edit')}
        onOpenChange={dialogs.onOpenChange}
        user={dialogs.item}
      />
      <UserHoursDialog
        open={dialogs.isOpen('hours')}
        onOpenChange={dialogs.onOpenChange}
        user={dialogs.item}
      />
      <UserEmailDialog
        open={dialogs.isOpen('email')}
        onOpenChange={dialogs.onOpenChange}
        user={dialogs.item}
      />
    </div>
  )
}
