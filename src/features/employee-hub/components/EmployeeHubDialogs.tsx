import { AbsenceDialogs } from '@/features/absences/components/admin/AbsenceDialogs'
import { AcompteDialogs } from '@/features/acomptes/components/admin/AcompteDialogs'
import { CouchetteCreateDialog } from '@/features/couchettes/components/CouchetteCreateDialog'
import { CouchetteDeleteDialog } from '@/features/couchettes/components/CouchetteDeleteDialog'
import { useDeleteAdminServiceMutation } from '@/features/user-services/api/useAdminServiceMutations'
import { DeleteServiceDialog } from '@/features/user-services/components/DeleteServiceDialog'
import { ServiceFormDialog } from '@/features/user-services/components/ServiceFormDialog'
import { ServiceLocationDialog } from '@/features/user-services/components/ServiceLocationDialog'
import { useDeleteUserMutation } from '@/features/users/api/useDeleteUserMutation'
import { DeleteUserDialog } from '@/features/users/components/DeleteUserDialog'
import { UserEditDialog } from '@/features/users/components/UserEditDialog'
import { UserEmailDialog } from '@/features/users/components/UserEmailDialog'
import { errorMessage, notifyError, notifySuccess } from '@/features/users/lib/messages'
import type { HubDialogs } from '../hooks/useHubDialogs'

type EmployeeHubDialogsProps = {
  userUuid: string
  dialogs: HubDialogs
  /** Après l'ajout, la modification ou la suppression d'un pointage */
  onServicesChanged: () => void
  /** Compte supprimé : la fiche revient à la liste des employés */
  onUserDeleted: () => void
}

/**
 * Tous les dialogs de la fiche, repris des pages du domaine (Pointages d'un employé, Absences,
 * Acomptes, Couchettes, Utilisateurs) ; les créations sont préremplies avec l'employé affiché.
 * Les listes se rechargent d'elles-mêmes (invalidation des requêtes après chaque action).
 */
export function EmployeeHubDialogs({
  userUuid,
  dialogs,
  onServicesChanged,
  onUserDeleted,
}: EmployeeHubDialogsProps) {
  const { services, account } = dialogs
  const deleteService = useDeleteAdminServiceMutation(userUuid)
  const deleteUser = useDeleteUserMutation()

  const handleDeleteService = () => {
    const serviceUuid = services.serviceToDelete?.uuid
    if (!serviceUuid) return
    deleteService.mutate(serviceUuid, {
      onSuccess: () => {
        services.close()
        onServicesChanged()
      },
      onError: (error) => notifyError(errorMessage(error, 'Erreur lors de la suppression')),
    })
  }

  const handleDeleteUser = () => {
    if (!account.item?.uuid) return
    deleteUser.mutate(account.item.uuid, {
      onSuccess: () => {
        notifySuccess('Utilisateur supprimé avec succès', 'Succès')
        account.close()
        onUserDeleted()
      },
      onError: (error) =>
        notifyError(errorMessage(error, 'Erreur lors de la suppression'), 'Erreur'),
    })
  }

  return (
    <>
      <ServiceFormDialog
        open={services.isOpen('form')}
        onOpenChange={services.onOpenChange}
        target={services.formTarget}
        userUuid={userUuid}
        onSaved={onServicesChanged}
      />
      <DeleteServiceDialog
        open={services.isOpen('delete')}
        onOpenChange={services.onOpenChange}
        service={services.serviceToDelete}
        isPending={deleteService.isPending}
        onConfirm={handleDeleteService}
      />
      <ServiceLocationDialog
        open={services.isOpen('location')}
        onOpenChange={services.onOpenChange}
        location={services.location}
      />

      <AbsenceDialogs dialogs={dialogs.absences} onChanged={() => {}} defaultUserUuid={userUuid} />
      <AcompteDialogs
        dialogs={dialogs.acomptes}
        onCreated={() => {}}
        onChanged={() => {}}
        defaultUserUuid={userUuid}
      />

      <CouchetteCreateDialog
        open={dialogs.couchettes.isOpen('create')}
        onOpenChange={dialogs.couchettes.onOpenChange}
        onCreated={() => {}}
        defaultUserUuid={userUuid}
      />
      <CouchetteDeleteDialog
        open={dialogs.couchettes.isOpen('delete')}
        onOpenChange={dialogs.couchettes.onOpenChange}
        couchette={dialogs.couchettes.item}
        onDeleted={() => {}}
      />

      <UserEditDialog
        open={account.isOpen('edit')}
        onOpenChange={account.onOpenChange}
        user={account.item}
      />
      <UserEmailDialog
        open={account.isOpen('email')}
        onOpenChange={account.onOpenChange}
        user={account.item}
      />
      <DeleteUserDialog
        open={account.isOpen('delete')}
        onOpenChange={account.onOpenChange}
        user={account.item}
        isPending={deleteUser.isPending}
        onConfirm={handleDeleteUser}
      />
    </>
  )
}
