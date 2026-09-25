import { useQuery } from '@tanstack/react-query'
import { vehiclesService, type FilesListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

const toFiles = (response: FilesListResponse) => response.files ?? []

/** Fichiers d'un véhicule (GET /vehicules/{id}/files). */
export function useVehicleFilesQuery(vehiculeId: string) {
  return useQuery({
    queryKey: vehiclesKeys.files(vehiculeId),
    queryFn: () => vehiclesService.getVehicleFiles(vehiculeId),
    select: toFiles,
  })
}
