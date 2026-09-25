import { useMutation, useQueryClient } from '@tanstack/react-query'
import { absencesService } from '@/services'
import { absenceKeys } from './queryKeys'

/**
 * Annulation d'une demande en attente par son auteur (DELETE /absences/{uuid}). C'est une
 * suppression : le statut `CANCELLED` affiché par l'interface n'existe pas côté API (8.3).
 */
export function useCancelAbsenceMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => absencesService.cancelAbsence(uuid),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: absenceKeys.all }),
  })
}
