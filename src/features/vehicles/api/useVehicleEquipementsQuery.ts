import { useQuery } from '@tanstack/react-query'
import { vehiculeEquipementsService, type VehiculeEquipementListResponse } from '@/services'
import { vehiclesKeys } from './queryKeys'

const toEquipements = (response: VehiculeEquipementListResponse) => response.equipements ?? []

/** Équipements d'un véhicule (GET /vehicules-equipements/vehicule/{id}), dans l'ordre de l'API. */
export function useVehicleEquipementsQuery(vehiculeId: string) {
  return useQuery({
    queryKey: vehiclesKeys.equipements(vehiculeId),
    queryFn: () => vehiculeEquipementsService.getByVehicule(vehiculeId),
    select: toEquipements,
  })
}
