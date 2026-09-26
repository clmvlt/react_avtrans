import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userServicesService, type ServiceUpdateRequest } from '@/services/userServices'
import { invalidateUserServices } from './invalidateUserServices'

/** Boutons de la carte de statut. */
export type AdminServiceAction = 'start' | 'end' | 'startBreak' | 'endBreak'

type AdminServiceActionVariables = {
  action: AdminServiceAction
  /** Pointage en cours (fin du service ou de la pause) */
  activeServiceUuid: string | null
}

/**
 * Démarrer / terminer le service ou la pause d'un employé, avec les mêmes appels que le Vue
 * (`createService` / `validateService`, heure de l'appareil en ISO UTC).
 *
 * Bug B-07 reproduit : « Démarrer une pause » fait 3 appels non atomiques (création, lecture du
 * pointage actif, passage en pause). Si l'API renvoie le service principal comme pointage actif,
 * c'est lui qui devient une pause.
 */
export function useAdminServiceActionMutation(userUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ action, activeServiceUuid }: AdminServiceActionVariables) => {
      const now = new Date().toISOString()
      switch (action) {
        case 'start':
          await userServicesService.createService({ userUuid, debut: now })
          return
        case 'startBreak': {
          await userServicesService.createService({ userUuid, debut: now })
          const response = await userServicesService.getActiveService(userUuid)
          if (response?.service?.uuid) {
            const request: ServiceUpdateRequest = { isBreak: true }
            await userServicesService.validateService(response.service.uuid, request)
          }
          return
        }
        case 'end':
        case 'endBreak':
          if (!activeServiceUuid) return
          await userServicesService.validateService(activeServiceUuid, { fin: now })
          return
      }
    },
    onSuccess: () => invalidateUserServices(queryClient, userUuid),
  })
}
