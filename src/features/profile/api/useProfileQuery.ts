import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services'
import { profileKeys } from './queryKeys'

/** Profil de l'utilisateur connecté (GET /profile), chargé à l'arrivée sur /profile. */
export function useProfileQuery() {
  return useQuery({
    queryKey: profileKeys.me(),
    // L'API renvoie directement le UserDTO (pas d'enveloppe)
    queryFn: async () => (await profileService.getProfile()) ?? null,
  })
}
