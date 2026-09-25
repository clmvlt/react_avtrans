import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acomptesService, type AcompteSearchParams, type AcompteSearchResponse } from '@/services'
import { acompteKeys } from './queryKeys'

type ToggleAcomptePaidVariables = {
  uuid: string
  isPaid: boolean
}

/**
 * [ADMIN] Bascule « payé / non payé » d'un acompte approuvé (PUT /acomptes/admin/{uuid}), en
 * mise à jour optimiste de la liste affichée, comme le Vue (qui modifiait l'objet en place) :
 * `isPaid` et `paidDate` (maintenant, ou vide) changent tout de suite et sont restaurés en cas
 * d'échec. L'erreur ne touche jamais l'état de la page (le Vue la remplaçait par un bandeau) :
 * l'appelant affiche un toast.
 */
export function useToggleAcomptePaidMutation(params: AcompteSearchParams) {
  const queryClient = useQueryClient()
  const queryKey = acompteKeys.adminList(params)

  return useMutation({
    mutationFn: ({ uuid, isPaid }: ToggleAcomptePaidVariables) =>
      acomptesService.updateAcompte(uuid, { isPaid }),
    onMutate: async ({ uuid, isPaid }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<AcompteSearchResponse>(queryKey)
      queryClient.setQueryData<AcompteSearchResponse>(queryKey, (current) =>
        current
          ? {
              ...current,
              acomptes: current.acomptes.map((acompte) =>
                acompte.uuid === uuid
                  ? {
                      ...acompte,
                      isPaid,
                      paidDate: isPaid ? new Date().toISOString() : undefined,
                    }
                  : acompte,
              ),
            }
          : current,
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: acompteKeys.all }),
  })
}
