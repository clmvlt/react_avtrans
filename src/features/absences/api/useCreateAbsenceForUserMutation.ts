import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absencesService, type AdminAbsenceCreateRequest } from '@/services'
import { absenceKeys } from './queryKeys'

/** [ADMIN] Création d'une absence pour un employé (POST /absences/admin/create). */
export function useCreateAbsenceForUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AdminAbsenceCreateRequest) => absencesService.createAbsenceForUser(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
