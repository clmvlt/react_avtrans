import { useQueryClient } from '@tanstack/react-query'
import { adminServicesKeys } from '../api/queryKeys'
import { useUserServicesQuery } from '../api/useUserServicesQuery'
import { useServiceFilters } from './useServiceFilters'

/**
 * Liste paginée des pointages d'un employé avec ses filtres. `reload(page)` reproduit
 * `loadServices(page)` du Vue : filtres saisis, page demandée (0 par défaut), et nouvelle requête
 * même si la page est déjà affichée (« Appliquer », « Réinitialiser », « Réessayer »).
 */
export function useUserServicesList(userUuid: string) {
  const queryClient = useQueryClient()
  const filters = useServiceFilters()
  const query = useUserServicesQuery(userUuid, filters.request.filters, filters.request.page)

  const refresh = () =>
    void queryClient.invalidateQueries({ queryKey: adminServicesKeys.userServices(userUuid) })

  const reload = (page = 0) => {
    filters.load(page)
    refresh()
  }

  return {
    filters,
    query,
    reload,
    /** Changement de page (avec les filtres saisis, comme le Vue) */
    goToPage: (page: number) => filters.load(page),
    apply: () => reload(0),
    reset: () => {
      filters.reset()
      refresh()
    },
  }
}
