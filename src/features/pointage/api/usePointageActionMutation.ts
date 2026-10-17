import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isLineRunning, received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import { userServicesService, type GpsLocationRequest } from '@/services'
import { pointageKeys } from './queryKeys'
import type { ActiveServiceCache } from './useActiveServiceQuery'

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
 * Les quatre actions de pointage (POST /services/start|end|break/start|break/end). Chacune renvoie
 * le service de travail dans son état après l'action (D12) : il remplace directement le service en
 * cours en cache (`null` une fois terminé), puis les heures et les services du jour sont rechargés.
 * La position GPS est demandée dans la mutation : `isPending` couvre la géolocalisation, l'appel
 * et ce rechargement (comme `actionLoading` du Vue). « Terminer » recharge aussi l'historique,
 * sans l'attendre. Erreur → toast, la page reste.
 */
export function usePointageActionMutation(requestLocation: () => Promise<GpsLocationRequest>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (action: PointageAction) => ACTIONS[action].run(await requestLocation()),
    onSuccess: async (service, action) => {
      // Une lecture partie avant l'action ne doit pas écraser l'état renvoyé par l'action
      await queryClient.cancelQueries({ queryKey: pointageKeys.active() })
      const cache: ActiveServiceCache = received({
        success: true,
        service: service && isLineRunning(service) ? service : null,
      })
      queryClient.setQueryData(pointageKeys.active(), cache)
      if (action === 'end') {
        void queryClient.invalidateQueries({ queryKey: pointageKeys.histories() })
      }
      await Promise.all(
        [pointageKeys.hours(), pointageKeys.daily()].map((queryKey) =>
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
