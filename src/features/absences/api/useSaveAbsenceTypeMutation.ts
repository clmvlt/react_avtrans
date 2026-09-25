import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absenceTypesService, type AbsenceTypeCreateRequest } from '@/services'
import { absenceKeys, absenceTypeKeys } from './queryKeys'

type SaveAbsenceTypeVariables = {
  /** Absent : création (POST /absence-types) ; présent : modification (PUT /absence-types/{uuid}). */
  uuid?: string
  data: AbsenceTypeCreateRequest
}

/**
 * [ADMIN] Création ou modification d'un type d'absence. Invalide aussi les absences, qui
 * embarquent le nom et la couleur de leur type.
 */
export function useSaveAbsenceTypeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: SaveAbsenceTypeVariables) =>
      uuid ? absenceTypesService.updateType(uuid, data) : absenceTypesService.createType(data),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: absenceTypeKeys.all }),
        queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
      ]),
  })
}
