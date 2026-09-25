import { useMutation } from '@tanstack/react-query'
import type { PasswordResetConfirmDTO } from '@/models'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/** POST /auth/password-reset/confirm. */
export function useConfirmPasswordResetMutation() {
  return useMutation({
    mutationKey: authKeys.passwordResetConfirm(),
    mutationFn: (data: PasswordResetConfirmDTO) => authService.confirmPasswordReset(data),
  })
}
