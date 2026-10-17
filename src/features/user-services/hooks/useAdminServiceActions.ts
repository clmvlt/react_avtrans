import { errorMessage, notifyError } from '@/features/users/lib/messages'
import {
  useAdminServiceActionMutation,
  type AdminServiceAction,
} from '../api/useAdminServiceActionMutation'
import type { AdminUserStatusInfo } from '../lib/serviceStatus'

const ACTION_ERRORS: Record<AdminServiceAction, string> = {
  start: 'Erreur lors du démarrage du service',
  end: 'Erreur lors de la fin du service',
  startBreak: 'Erreur lors du démarrage de la pause',
  endBreak: 'Erreur lors de la fin de la pause',
}

/**
 * Boutons de la carte de statut d'un employé. Un échec s'affiche en toast, avec le message de
 * l'API tel quel s'il y en a un (le Vue remplaçait toute la liste des pointages par le message :
 * corrigé par construction, MIGRATION.md 8.1). `onDone` : après succès, retour à la première page
 * de la liste, comme le Vue.
 */
export function useAdminServiceActions(
  userUuid: string,
  statusInfo: AdminUserStatusInfo,
  onDone: () => void,
) {
  const mutation = useAdminServiceActionMutation(userUuid)

  const run = (action: AdminServiceAction) =>
    mutation.mutate(
      {
        action,
        serviceUuid: statusInfo.service?.uuid ?? null,
        pauseUuid: statusInfo.pause?.uuid ?? null,
      },
      {
        onSuccess: onDone,
        onError: (error) => notifyError(errorMessage(error, ACTION_ERRORS[action])),
      },
    )

  return {
    isPending: mutation.isPending,
    startService: () => run('start'),
    endService: () => run('end'),
    startBreak: () => run('startBreak'),
    endBreak: () => run('endBreak'),
  }
}
