import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absencesService } from '@/services'
import { absenceKeys } from './queryKeys'

/** [ADMIN] Suppression définitive d'une absence (DELETE /absences/admin/{uuid}). */
export function useDeleteAbsenceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => absencesService.deleteAbsence(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
