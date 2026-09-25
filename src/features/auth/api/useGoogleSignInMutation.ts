import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/**
 * Étape 1 Google : POST /auth/google avec l'ID token (le service stocke le token si
 * AUTHENTICATED). Le branchement AUTHENTICATED / NEEDS_REGISTRATION est fait par useGoogleSignIn.
 */
export function useGoogleSignInMutation() {
  return useMutation({
    mutationKey: authKeys.google(),
    mutationFn: (idToken: string) => authService.loginWithGoogle(idToken),
  })
}
