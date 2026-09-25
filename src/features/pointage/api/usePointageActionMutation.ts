import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ServiceDTO } from '@/models'
import { userServicesService, type GpsLocationRequest } from '@/services'
import { pointageKeys } from './queryKeys'

export type PointageAction = 'start' | 'end' | 'startBreak' | 'endBreak'

const ACTIONS: Record<
  PointageAction,
  { run: (location: GpsLocationRequest) => Promise<ServiceDTO>; errorMessage: string }
> = {
  start: {
    run: (location) => userServicesService.startService(location),
    errorMessage: 'Erreur lors du démarrage du service',
  },
  end: {
    run: (location) => userServicesService.endService(location),
    errorMessage: "Erreur lors de l'arrêt du service",
  },
  startBreak: {
    run: (location) => userServicesService.startBreak(location),
    errorMessage: 'Erreur lors du démarrage de la pause',
  },
  endBreak: {
    run: (location) => userServicesService.endBreak(location),
    errorMessage: 'Erreur lors de la fin de la pause',
  },
}

/**
 * Les quatre actions de pointage (POST /services/start|end|break/start|break/end).
 * La position GPS est demandée dans la mutation : `isPending` couvre la géolocalisation, l'appel
 * et le rechargement de l'état (comme `actionLoading` du Vue, qui attendait `loadData()`).
 * « Terminer » recharge aussi l'historique, sans l'attendre. Erreur → toast, la page reste.
 */
export function usePointageActionMutation(requestLocation: () => Promise<GpsLocationRequest>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (action: PointageAction) => ACTIONS[action].run(await requestLocation()),
    onSuccess: async (service, action) => {
      queryClient.setQueryData(pointageKeys.active(), {
        success: true,
        service: action === 'end' ? null : service,
      })
      if (action === 'end') {
        void queryClient.invalidateQueries({ queryKey: pointageKeys.histories() })
      }
      await Promise.all(
        [pointageKeys.active(), pointageKeys.hours(), pointageKeys.daily()].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      )
    },
    onError: (error, action) => {
      toast.error(error instanceof Error ? error.message : ACTIONS[action].errorMessage, {
        duration: 7000,
      })
    },
  })
}
