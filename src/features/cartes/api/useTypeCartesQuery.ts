import { useQuery } from '@tanstack/react-query'
import type { TypeCarteDTO } from '@/models'
import { typeCartesService } from '@/services'
import { typeCartesKeys } from './queryKeys'

const toTypeCartes = (response: TypeCarteDTO[]) => (Array.isArray(response) ? response : [])

/** Types de cartes (GET /type-cartes, tableau nu) : page des types et sélecteur du formulaire. */
export function useTypeCartesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: typeCartesKeys.list(),
    queryFn: () => typeCartesService.getTypeCartes(),
    select: toTypeCartes,
    enabled,
  })
}
