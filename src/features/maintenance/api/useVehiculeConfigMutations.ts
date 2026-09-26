import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  vehiculesTypesEntretienService,
  type VehiculeTypeEntretienCreateRequest,
  type VehiculeTypeEntretienUpdateRequest,
} from '@/services'
import { maintenanceKeys } from './queryKeys'

/** Configurations du véhicule et prochains entretiens (le Vue rechargeait les deux). */
function invalidateAfterConfigChange(queryClient: QueryClient, vehiculeId: string) {
  void queryClient.invalidateQueries({ queryKey: maintenanceKeys.vehicleConfigs(vehiculeId) })
  void queryClient.invalidateQueries({ queryKey: maintenanceKeys.upcoming() })
}

/** POST /vehicules-types-entretien. */
export function useCreateVehiculeConfigMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: VehiculeTypeEntretienCreateRequest) =>
      vehiculesTypesEntretienService.create(data),
    onSuccess: (_response, data) => invalidateAfterConfigChange(queryClient, data.vehiculeId),
  })
}

type UpdateVehiculeConfigVariables = {
  id: string
  vehiculeId: string
  data: VehiculeTypeEntretienUpdateRequest
}

/** PUT /vehicules-types-entretien/{id}. */
export function useUpdateVehiculeConfigMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: UpdateVehiculeConfigVariables) =>
      vehiculesTypesEntretienService.update(id, data),
    onSuccess: (_response, { vehiculeId }) => invalidateAfterConfigChange(queryClient, vehiculeId),
  })
}

type DeleteVehiculeConfigVariables = {
  id: string
  vehiculeId: string
}

/** DELETE /vehicules-types-entretien/{id}. */
export function useDeleteVehiculeConfigMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: DeleteVehiculeConfigVariables) =>
      vehiculesTypesEntretienService.delete(id),
    onSuccess: (_response, { vehiculeId }) => invalidateAfterConfigChange(queryClient, vehiculeId),
  })
}
