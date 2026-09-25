import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absencesService, type AbsenceValidationRequest } from '@/services'
import { absenceKeys } from './queryKeys'

type ValidateAbsenceVariables = {
  uuid: string
} & AbsenceValidationRequest

/** Approbation ou refus d'une absence (admin). Partagé par Absences et Planning. */
export function useValidateAbsenceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, ...data }: ValidateAbsenceVariables) =>
      absencesService.validateAbsence(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
