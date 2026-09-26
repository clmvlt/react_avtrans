import { useQuery } from '@tanstack/react-query'
import type { CarteDTO } from '@/models'
import { cartesService } from '@/services'
import { cartesKeys } from './queryKeys'

const toCartes = (response: CarteDTO[]) => (Array.isArray(response) ? response : [])

/**
 * Liste des cartes (GET /cartes, tableau nu). Le Vue chargeait aussi les types et les
 * utilisateurs sans les afficher : ces deux appels inutiles ne sont pas repris (MIGRATION.md 8.1).
 */
export function useCartesQuery() {
  return useQuery({
    queryKey: cartesKeys.list(),
    queryFn: () => cartesService.getCartes(),
    select: toCartes,
  })
}
