import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateProfileRequest, UserDTO } from '@/models'
import { profileService } from '@/services'
import { useAuthStore } from '@/stores/auth-store'
import { profileKeys } from './queryKeys'

/**
 * Met à jour le profil (PUT /profile) : nom et photo depuis /profile, adresse et permis depuis le
 * dialog de complétion. Ensuite, comme le Vue, l'utilisateur du store est rafraîchi
 * (`refreshUser`, GET /profile) et la page /profile affiche cet utilisateur rafraîchi.
 * La mutation reste « en cours » jusqu'à la fin du rafraîchissement.
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: [...profileKeys.all, 'update'],
    mutationFn: (data: UpdateProfileRequest) => profileService.updateProfile(data),
    onSuccess: async () => {
      await useAuthStore.getState().refreshUser()
      const refreshedUser = useAuthStore.getState().user
      if (refreshedUser) {
        queryClient.setQueryData<UserDTO | null>(profileKeys.me(), (profile) =>
          profile === undefined ? profile : refreshedUser,
        )
      }
    },
  })
}
