import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { acomptesService, type AcompteSearchParams } from '@/services'
import { acompteKeys } from './queryKeys'

/** Recherche admin des acomptes (POST /acomptes/admin/search), paginée côté serveur. */
export function useAdminAcomptesQuery(params: AcompteSearchParams) {
  return useQuery({
    queryKey: acompteKeys.adminList(params),
    queryFn: () => acomptesService.searchAcomptes(params),
    placeholderData: keepPreviousData,
  })
}
