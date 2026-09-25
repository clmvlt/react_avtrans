import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absencesService, type AbsenceCreateRequest } from '@/services'
import { absenceKeys } from './queryKeys'

/** Demande d'absence de l'utilisateur connecté (POST /absences). */
export function useCreateAbsenceRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AbsenceCreateRequest) => absencesService.createAbsenceRequest(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
