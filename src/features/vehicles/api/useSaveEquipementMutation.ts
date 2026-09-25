import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehiculeEquipementsService } from '@/services'
import { vehiclesKeys } from './queryKeys'

type SaveEquipementVariables = {
  /** Équipement modifié ; absent = création. */
  equipementId?: string
  nom: string
  quantite: number
  commentaire?: string
}

/**
 * Création (POST /vehicules-equipements) ou modification (PUT /vehicules-equipements/{id})
 * d'un équipement, comme VehiculeEquipementModal.vue.
 */
export function useSaveEquipementMutation(vehiculeId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ equipementId, nom, quantite, commentaire }: SaveEquipementVariables) =>
      equipementId
        ? vehiculeEquipementsService.update(equipementId, { nom, quantite, commentaire })
        : vehiculeEquipementsService.create({ vehiculeId, nom, quantite, commentaire }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: vehiclesKeys.equipements(vehiculeId) }),
  })
}
