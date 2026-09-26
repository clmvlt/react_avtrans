import { selectIsAdmin, selectIsMechanic, useAuthStore } from '@/stores/auth-store'

/**
 * Droits de gestion d'EntretiensVehicule et de TypesEntretien : administrateur **ou** mécanicien
 * (toujours vrai derrière la garde `RequireRole role="mechanic"`, comme `isMecanicien` du Vue).
 *
 * Attention : /entretiens n'utilise pas ce hook. Entretiens.vue teste l'UUID administrateur
 * seulement (bug B-04 reproduit, voir EntretiensPage).
 */
export function useCanManageMaintenance() {
  const isAdmin = useAuthStore(selectIsAdmin)
  const isMechanic = useAuthStore(selectIsMechanic)
  return isAdmin || isMechanic
}
