import { useQuery } from '@tanstack/react-query'
import { authService } from '@/services'
import { authKeys } from './queryKeys'

/**
 * GET /auth/verify?token=… (timeout 60 s dans le service). Le token est à usage unique :
 * un seul appel, y compris sous StrictMode (dédoublonnage de TanStack Query), sans nouvelle
 * tentative ni rafraîchissement automatique. Une vérification réussie reste en cache : revenir
 * sur la page ne rejoue pas l'appel (qui échouerait, le token ayant déjà servi).
 */
export function useVerifyEmailQuery(token: string | null) {
  return useQuery({
    queryKey: authKeys.verifyEmail(token ?? ''),
    queryFn: () => authService.verifyEmail(token ?? ''),
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
