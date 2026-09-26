import { useQuery } from '@tanstack/react-query'
import { typeCartesService } from '@/services'
import { typeCartesKeys } from './queryKeys'

/**
 * Détail d'un type de carte (GET /type-cartes/{uuid}, DTO nu), rechargé à chaque ouverture du
 * formulaire d'édition comme le Vue (`gcTime: 0`).
 */
export function useTypeCarteQuery(uuid: string | undefined, { enabled = true } = {}) {
  return useQuery({
    queryKey: typeCartesKeys.detail(uuid ?? ''),
    queryFn: () => typeCartesService.getTypeCarteById(uuid ?? ''),
    enabled: enabled && !!uuid,
    gcTime: 0,
  })
}
