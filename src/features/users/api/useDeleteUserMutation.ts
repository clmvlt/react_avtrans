import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '@/services'
import { usersKeys } from './queryKeys'
import { updateUsersListCache } from './usersListCache'

/**
 * Suppression définitive d'un compte (DELETE /users/{uuid}). Comme le Vue, l'utilisateur est
 * retiré de la liste en cache sans la recharger ; le badge « en attente » de la navbar, qui lit le
 * même cache, suit (dans le Vue il restait périmé : partie de B-25 qui disparaît par construction).
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => usersService.deleteUser(uuid),
    onSuccess: (_response, uuid) => {
      updateUsersListCache(queryClient, (users) => users.filter((u) => u.uuid !== uuid))
      queryClient.removeQueries({ queryKey: usersKeys.detail(uuid) })
    },
  })
}
