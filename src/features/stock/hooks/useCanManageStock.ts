import { selectIsAdmin, selectIsMechanic, useAuthStore } from '@/stores/auth-store'

/**
 * Droits de gestion du stock (création, modification, suppression, glisser-déposer, stepper).
 * Le Vue comparait le rôle à deux UUID codés en dur (administrateur, mécanicien) : mêmes rôles,
 * via les sélecteurs du store. Derrière la garde `mécanicien`, c'est toujours vrai ; la branche
 * « lecture seule » est conservée à l'identique.
 */
export function useCanManageStock() {
  const isAdmin = useAuthStore(selectIsAdmin)
  const isMechanic = useAuthStore(selectIsMechanic)
  return isAdmin || isMechanic
}
