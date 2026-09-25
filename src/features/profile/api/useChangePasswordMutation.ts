import { useMutation } from '@tanstack/react-query'
import type { ChangePasswordRequest } from '@/models'
import { profileService } from '@/services'
import { profileKeys } from './queryKeys'

/** Change le mot de passe (PUT /profile/password). */
export function useChangePasswordMutation() {
  return useMutation({
    mutationKey: [...profileKeys.all, 'password'],
    mutationFn: (data: ChangePasswordRequest) => profileService.changePassword(data),
  })
}
