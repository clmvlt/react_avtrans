import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userServicesService, type ServiceCreateRequest } from '@/services/userServices'
import { invalidateUserServices } from './invalidateUserServices'

/** Boutons de la carte de statut. */
export type AdminServiceAction = 'start' | 'end' | 'startBreak' | 'endBreak'

type AdminServiceActionVariables = {
  action: AdminServiceAction
  /** Service de travail en cours (« Terminer le service ») */
  serviceUuid: string | null
  /** Pause en cours (« Terminer la pause ») */
  pauseUuid: string | null
}

/** Le type local du service n'a pas `isBreak`, que l'API accepte (comme `useAdminServiceMutations`). */
type CreateRequest = ServiceCreateRequest & { isBreak?: boolean }

/**
 * Démarrer / terminer le service ou la pause d'un employé, avec les mêmes routes que le Vue
 * (`createService` / `validateService`, heure de l'appareil en ISO UTC).
 *
 * D12 : « Démarrer une pause » crée directement une pause, que l'API rattache au service en cours
 * (bug B-07 corrigé par construction : l'ancien enchaînement création + lecture + passage en
 * pause est refusé, l'employé ayant déjà un service en cours). « Terminer la pause » clôt la pause
 * en cours, et non plus la ligne renvoyée comme pointage actif (toujours le service).
 */
export function useAdminServiceActionMutation(userUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ action, serviceUuid, pauseUuid }: AdminServiceActionVariables) => {
      const now = new Date().toISOString()
      switch (action) {
        case 'start':
          await userServicesService.createService({ userUuid, debut: now })
          return
        case 'startBreak': {
          const request: CreateRequest = { userUuid, debut: now, isBreak: true }
          await userServicesService.createService(request)
          return
        }
        case 'end':
          if (!serviceUuid) return
          await userServicesService.validateService(serviceUuid, { fin: now })
          return
        case 'endBreak':
          if (!pauseUuid) return
          await userServicesService.validateService(pauseUuid, { fin: now })
          return
      }
    },
    onSuccess: () => invalidateUserServices(queryClient, userUuid),
  })
}
