import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService } from '@/services'
import { vehiclesKeys } from './queryKeys'

type AddKilometrageVariables = {
  vehiculeId: string
  km: number
  /** Date du relevé (ISO) : réservé à l'admin, bascule sur POST /vehicules/admin/kilometrages */
  createdAt?: string
}

/**
 * Ajout d'un relevé kilométrique. Partagé par le détail véhicule et le Pointage.
 * `onSuccess` des appelants peut compléter l'invalidation (ex. dernier km de l'utilisateur).
 */
export function useAddKilometrageMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vehiculeId, km, createdAt }: AddKilometrageVariables) =>
      createdAt
        ? vehiclesService.addKilometrageAdmin({ vehiculeId, km, createdAt })
        : vehiclesService.addKilometrage({ vehiculeId, km }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.all }),
  })
}
