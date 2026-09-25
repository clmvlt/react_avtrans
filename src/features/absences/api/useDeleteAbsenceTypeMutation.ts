import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absenceTypesService } from '@/services'
import { absenceKeys, absenceTypeKeys } from './queryKeys'

/** [ADMIN] Suppression d'un type d'absence (DELETE /absence-types/{uuid}). */
export function useDeleteAbsenceTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => absenceTypesService.deleteType(uuid),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: absenceTypeKeys.all }),
        queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
      ]),
  })
}
