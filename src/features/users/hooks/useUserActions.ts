import { useNavigate } from 'react-router'
import type { UserDTO } from '@/models'

export type UserDialogType = 'edit' | 'email' | 'hours' | 'delete'

/** Actions proposées sur un compte (boutons du tableau, menu mobile, clic droit). */
export type UserActions = {
  goToServices: (user: UserDTO) => void
  openHours: (user: UserDTO) => void
  goToAbsences: (user: UserDTO) => void
  openEmail: (user: UserDTO) => void
  openEdit: (user: UserDTO) => void
  confirmDelete: (user: UserDTO) => void
}

/**
 * Actions communes aux boutons du tableau, au menu des cartes mobiles et au clic droit :
 * navigation (pointages de l'employé, absences filtrées par `?userUuid=`) ou ouverture d'un dialog.
 */
export function useUserActions(openDialog: (type: UserDialogType, user: UserDTO) => void) {
  const navigate = useNavigate()

  const actions: UserActions = {
    goToServices: (user) => navigate(`/users/${user.uuid}/services`),
    openHours: (user) => openDialog('hours', user),
    goToAbsences: (user) =>
      navigate({
        pathname: '/absences',
        search: user.uuid ? `?${new URLSearchParams({ userUuid: user.uuid })}` : '',
      }),
    openEmail: (user) => openDialog('email', user),
    openEdit: (user) => openDialog('edit', user),
    confirmDelete: (user) => openDialog('delete', user),
  }

  return actions
}
