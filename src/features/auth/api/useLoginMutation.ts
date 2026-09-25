import { useMutation } from '@tanstack/react-query'
import type { LoginRequest } from '@/models'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/**
 * POST /auth/login (le service stocke déjà le token). Les contrôles e-mail vérifié / compte actif
 * et l'application de la session sont faits par l'appelant, comme Login.vue.
 */
export function useLoginMutation() {
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
  })
}
