import type { UserDTO } from '@/models'
import { useUpdateUserMutation } from '../api/useUpdateUserMutation'
import { errorMessage, notifyError, notifySuccess } from '../lib/messages'

/**
 * Bouton « Activer » des comptes en attente : PUT `{ isActive: true }`, réponse fusionnée dans la
 * liste (le compte quitte la section et le badge de la navbar suit).
 */
export function useActivateUser() {
  const mutation = useUpdateUserMutation()

  const activate = (user: UserDTO) => {
    if (!user.uuid) return
    mutation.mutate(
      { uuid: user.uuid, data: { isActive: true } },
      {
        onSuccess: () =>
          notifySuccess(
            `Le compte de ${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() + ' a été activé',
            'Compte activé',
          ),
        onError: (error) =>
          notifyError(errorMessage(error, "Erreur lors de l'activation du compte"), 'Erreur'),
      },
    )
  }

  return {
    activate,
    /** Compte en cours d'activation */
    activatingUuid: mutation.isPending ? (mutation.variables?.uuid ?? null) : null,
  }
}
