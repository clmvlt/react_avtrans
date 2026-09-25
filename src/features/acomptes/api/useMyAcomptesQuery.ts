import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { acomptesService, type AcompteSearchParams } from '@/services'
import { acompteKeys } from './queryKeys'

/**
 * Mes demandes d'acompte (POST /acomptes/my). Sans dates, le serveur ne renvoie que les demandes
 * créées dans [aujourd'hui − 30 j ; + 10 ans] (limite de l'API, MIGRATION.md 8.3).
 */
export function useMyAcomptesQuery(params: AcompteSearchParams) {
  return useQuery({
    queryKey: acompteKeys.myList(params),
    queryFn: () => acomptesService.getAcomptes(params),
    placeholderData: keepPreviousData,
  })
}
