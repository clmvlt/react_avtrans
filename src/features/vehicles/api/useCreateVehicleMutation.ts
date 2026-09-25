import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiclesService, type VehiculeCreateRequest } from '@/services'
import { vehiclesKeys } from './queryKeys'

/** Création d'un véhicule (POST /vehicules, photo en data-URL dans `pictureBase64`). */
export function useCreateVehicleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VehiculeCreateRequest) => vehiclesService.createVehicle(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.list() }),
  })
}
