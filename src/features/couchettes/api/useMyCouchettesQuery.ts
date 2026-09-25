import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { couchettesService } from '@/services'
import { couchettesKeys } from './queryKeys'

/**
 * Mes couchettes, paginées (GET /couchettes/me). La page précédente reste affichée pendant le
 * chargement de la suivante (héros et compteurs compris, comme le Vue).
 */
export function useMyCouchettesQuery(params: { page: number; size: number }) {
  return useQuery({
    queryKey: couchettesKeys.mine(params),
    queryFn: () => couchettesService.getMyCouchettes(params),
    placeholderData: keepPreviousData,
  })
}
