import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absencesService, type AdminAbsenceUpdateRequest } from '@/services'
import { absenceKeys } from './queryKeys'

type UpdateAbsenceVariables = {
  uuid: string
  data: AdminAbsenceUpdateRequest
}

/** [ADMIN] Modification d'une absence non approuvée (PUT /absences/admin/{uuid}). */
export function useUpdateAbsenceByAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: UpdateAbsenceVariables) =>
      absencesService.updateAbsenceByAdmin(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
