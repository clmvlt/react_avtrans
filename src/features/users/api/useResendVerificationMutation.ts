import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services'
import { usersKeys } from './queryKeys'
import { updateUsersListCache } from './usersListCache'

type ResendVerificationVariables = {
  uuid: string
  email: string
}

/**
 * Change l'e-mail d'un compte ou renvoie l'e-mail de vérification
 * (POST /users/{uuid}/resend-verification, timeout 60 s). Renvoie l'utilisateur à jour.
 * Bug B-25 du Vue reproduit : l'utilisateur de la liste est remplacé par la réponse, sans fusion.
 */
export function useResendVerificationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ uuid, email }: ResendVerificationVariables) => {
      const response = await usersService.resendVerificationEmail(uuid, email)
      if (!response || !response.user) {
        throw new Error('Aucune donnée utilisateur dans la réponse')
      }
      return response.user
    },
    onSuccess: (user, { uuid }) => {
      updateUsersListCache(queryClient, (users) =>
        users.map((u) => (u.uuid === user.uuid ? user : u)),
      )
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(uuid) })
    },
  })
}
