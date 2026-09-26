import { useNavigate } from 'react-router'
import type { UserWithStatusDTO } from '@/models'

/** Actions proposées sur un employé du suivi des présences (menus « ⋮ » et clic droit). */
export type MonitoringActions = {
  goToServices: (user: UserWithStatusDTO) => void
  /**
   * Entrée « Services » du menu « ⋮ ». Bug B-16 reproduit : `window.location.href` recharge toute
   * l'application au lieu d'une navigation interne.
   */
  reloadToServices: (user: UserWithStatusDTO) => void
  openHours: (user: UserWithStatusDTO) => void
  goToAbsences: (user: UserWithStatusDTO) => void
  goToAcomptes: (user: UserWithStatusDTO) => void
}

const userUuidSearch = (user: UserWithStatusDTO) =>
  user.uuid ? `?${new URLSearchParams({ userUuid: user.uuid })}` : ''

/** Navigation vers les pointages, absences et acomptes de l'employé (`?userUuid=`), ou ses heures. */
export function useMonitoringActions(
  openHours: (user: UserWithStatusDTO) => void,
): MonitoringActions {
  const navigate = useNavigate()

  return {
    goToServices: (user) => navigate(`/users/${user.uuid}/services`),
    reloadToServices: (user) => {
      window.location.href = `/users/${user.uuid}/services`
    },
    openHours: (user) => {
      if (user.uuid) openHours(user)
    },
    goToAbsences: (user) => navigate({ pathname: '/absences', search: userUuidSearch(user) }),
    goToAcomptes: (user) => navigate({ pathname: '/acomptes', search: userUuidSearch(user) }),
  }
}
