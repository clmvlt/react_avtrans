import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/** POST /auth/password-reset/request. */
export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationKey: authKeys.passwordResetRequest(),
    mutationFn: (email: string) => authService.requestPasswordReset(email),
  })
}
