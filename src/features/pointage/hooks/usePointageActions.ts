import type { GpsLocationRequest } from '@/services'
import { usePointageActionMutation, type PointageAction } from '../api/usePointageActionMutation'

type UsePointageActionsOptions = {
  requestLocation: () => Promise<GpsLocationRequest>
  /** Rôle Utilisateur sans kilométrage saisi aujourd'hui : « Démarrer » ouvre d'abord le dialog */
  needsKilometrage: boolean
  /** Ouvre le dialog de kilométrage obligatoire (le service démarre après l'enregistrement) */
  onKilometrageRequired: () => void
}

/** Actions de la carte d'état et de la barre mobile : démarrer, pause, reprendre, terminer. */
export function usePointageActions({
  requestLocation,
  needsKilometrage,
  onKilometrageRequired,
}: UsePointageActionsOptions) {
  const mutation = usePointageActionMutation(requestLocation)
  const run = (action: PointageAction) => mutation.mutate(action)

  return {
    isPending: mutation.isPending,
    start: () => (needsKilometrage ? onKilometrageRequired() : run('start')),
    /** Démarrage sans contrôle du kilométrage (juste après sa saisie obligatoire) */
    startNow: () => run('start'),
    pause: () => run('startBreak'),
    resume: () => run('endBreak'),
    end: () => run('end'),
  }
}
