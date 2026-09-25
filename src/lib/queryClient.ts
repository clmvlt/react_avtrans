import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api'

/**
 * Client TanStack Query unique de l'application.
 *
 * Réglages choisis pour rester au plus près du comportement du Vue :
 * - pas de rafraîchissement au retour sur l'onglet (le Vue chargeait au montage uniquement) ;
 *   les requêtes qui en ont besoin l'activent explicitement ;
 * - une seule nouvelle tentative, et seulement sur une erreur réseau, un timeout ou une 5xx :
 *   les 4xx (400 « introuvable », 401, 403…) sont des réponses définitives de l'API.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false
        if (!(error instanceof ApiError)) return false
        const status = error.status ?? 0
        return status === 0 || status === 408 || status >= 500
      },
    },
    mutations: {
      retry: false,
    },
  },
})
