import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CarteCreateRequest, CarteUpdateRequest } from '@/models'
import { cartesService } from '@/services'
import { cartesKeys } from './queryKeys'

type SaveCarteVariables =
  { uuid?: undefined; data: CarteCreateRequest } | { uuid: string; data: CarteUpdateRequest }

/**
 * Création (POST /cartes) ou modification (PUT /cartes/{uuid}) d'une carte, puis rechargement
 * de la liste comme le Vue (sans le spinner pleine page).
 */
export function useSaveCarteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (variables: SaveCarteVariables) =>
      variables.uuid !== undefined
        ? cartesService.updateCarte(variables.uuid, variables.data)
        : cartesService.createCarte(variables.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cartesKeys.list() })
    },
  })
}
