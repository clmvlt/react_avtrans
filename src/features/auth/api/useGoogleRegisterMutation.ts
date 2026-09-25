import { useMutation } from '@tanstack/react-query'
import type { GoogleRegisterRequest } from '@/models'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/** Étape 2 Google : POST /auth/google/register (compte créé en attente d'activation). */
export function useGoogleRegisterMutation() {
  return useMutation({
    mutationKey: authKeys.googleRegister(),
    mutationFn: (data: GoogleRegisterRequest) => authService.registerWithGoogle(data),
  })
}
