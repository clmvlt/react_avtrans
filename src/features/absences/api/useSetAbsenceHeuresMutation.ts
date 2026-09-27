import { useMutation, useQueryClient } from '@tanstack/react-query'
import { hoursKeys } from '@/features/hours/api/queryKeys'
import { absencesService } from '@/services'
import { absenceKeys } from './queryKeys'

type SetAbsenceHeuresVariables = {
  uuid: string
  /** `null` : retour au calcul automatique. */
  heures: number | null
}

/**
 * [ADMIN] Heures d'une absence fixées à la main (PUT /absences/admin/{uuid}/heures, D8). Invalide
 * les absences et les comparaisons « Heures contrat », qui en dépendent.
 */
export function useSetAbsenceHeuresMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, heures }: SetAbsenceHeuresVariables) =>
      absencesService.setHeuresForcees(uuid, { heures }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
        queryClient.invalidateQueries({ queryKey: hoursKeys.contractComparisons() }),
      ]),
  })
}
