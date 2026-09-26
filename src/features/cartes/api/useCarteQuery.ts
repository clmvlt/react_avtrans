import { useQuery } from '@tanstack/react-query'
import { cartesService } from '@/services'
import { cartesKeys } from './queryKeys'

/**
 * Détail d'une carte (GET /cartes/{uuid}, DTO nu), rechargé à chaque ouverture du formulaire
 * d'édition comme le Vue : `gcTime: 0` pour ne pas réutiliser une version en cache.
 */
export function useCarteQuery(uuid: string | undefined, { enabled = true } = {}) {
  return useQuery({
    queryKey: cartesKeys.detail(uuid ?? ''),
    queryFn: () => cartesService.getCarteById(uuid ?? ''),
    enabled: enabled && !!uuid,
    gcTime: 0,
  })
}
