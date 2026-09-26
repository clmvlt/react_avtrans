import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { TypeCarteCreateRequest } from '@/models'
import { typeCartesService } from '@/services'
import { cartesKeys, typeCartesKeys } from './queryKeys'

type SaveTypeCarteVariables = {
  /** Type modifié ; absent en création. */
  uuid?: string
  data: TypeCarteCreateRequest
}

/**
 * Création (POST /type-cartes) ou modification (PUT /type-cartes/{uuid}) d'un type de carte,
 * puis rechargement de la liste. Les cartes embarquent le nom de leur type : leur cache est
 * aussi marqué périmé.
 */
export function useSaveTypeCarteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: SaveTypeCarteVariables) =>
      uuid
        ? typeCartesService.updateTypeCarte(uuid, data)
        : typeCartesService.createTypeCarte(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartesKeys.all })
      void queryClient.invalidateQueries({ queryKey: typeCartesKeys.list() })
    },
  })
}
