import { useMutation } from '@tanstack/react-query'
import type { RegisterRequest } from '@/models'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/** POST /auth/register. */
export function useRegisterMutation() {
  return useMutation({
    mutationKey: authKeys.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
  })
}
