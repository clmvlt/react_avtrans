import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateUserRequest, UserDTO } from '@/models'
import { usersService } from '@/services'
import { usersKeys } from './queryKeys'
import { extractUser, updateUsersListCache } from './usersListCache'

type UpdateUserVariables = {
  uuid: string
  data: UpdateUserRequest
}

type UseUpdateUserMutationOptions = {
  /**
   * Mise à jour de la liste en cache après succès (le Vue ne rechargeait pas la liste) :
   * - `merge` (défaut) : la réponse est fusionnée dans l'utilisateur existant (bouton « Activer ») ;
   * - `replace` : l'utilisateur est **remplacé** par la réponse, sans fusion (dialog d'édition).
   *   Bug B-25 du Vue reproduit : si la réponse du PUT ne contient pas `status`, la présence
   *   retombe à « Absent » jusqu'au prochain chargement de la page.
   */
  cacheUpdate?: 'merge' | 'replace'
}

/** Modification d'un compte par un admin (PUT /users/{uuid}). Renvoie l'utilisateur à jour. */
export function useUpdateUserMutation({
  cacheUpdate = 'merge',
}: UseUpdateUserMutationOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ uuid, data }: UpdateUserVariables): Promise<UserDTO | undefined> => {
      const response = await usersService.updateUser(uuid, data)
      const user = extractUser(response)
      // Le dialog d'édition du Vue échouait si la réponse ne contenait pas l'utilisateur
      if (cacheUpdate === 'replace' && !user) {
        throw new Error('Aucune donnée utilisateur dans la réponse')
      }
      return user
    },
    onSuccess: (user, { uuid, data }) => {
      if (cacheUpdate === 'replace' && user) {
        updateUsersListCache(queryClient, (users) =>
          users.some((u) => u.uuid === user.uuid)
            ? users.map((u) => (u.uuid === user.uuid ? user : u))
            : [...users, user],
        )
      } else {
        // Activation : `{ ...existant, ...réponse, isActive: true }`, comme Users.vue
        updateUsersListCache(queryClient, (users) =>
          users.map((u) =>
            u.uuid === uuid
              ? {
                  ...u,
                  ...user,
                  ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
                }
              : u,
          ),
        )
      }
      void queryClient.invalidateQueries({ queryKey: usersKeys.detail(uuid) })
    },
  })
}
