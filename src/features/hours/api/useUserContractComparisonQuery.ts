import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import type { UserContractComparisonResponse } from '@/models'
import { usersService } from '@/services'
import { buildContractRows, type ContractRow } from '../lib/contractFormat'
import { hoursKeys } from './queryKeys'

export type UserContractComparisonData = {
  /** Comparaison avec les totaux D8 et la prévision D10, `null` si l'API ne renvoie rien */
  row: ContractRow | null
  /** Réception de la réponse : base des compteurs en direct (D12) */
  receivedAt: number
}

const toData = ({
  data,
  receivedAt,
}: Received<UserContractComparisonResponse>): UserContractComparisonData => ({
  row: data?.data ? (buildContractRows([data.data], '')[0] ?? null) : null,
  receivedAt,
})

/**
 * Heures contrat / heures effectuées d'un employé pour un mois (GET /users/{uuid}/contract-hours),
 * même calcul que la page Heures contrat. Le mois précédent reste affiché pendant le chargement.
 */
export function useUserContractComparisonQuery(userUuid: string, year: number, month: number) {
  return useQuery({
    queryKey: hoursKeys.userContractComparison(userUuid, year, month),
    queryFn: () => receive(usersService.getUserContractComparison(userUuid, year, month)),
    select: toData,
    placeholderData: keepPreviousData,
    enabled: !!userUuid,
    ...liveQueryOptions,
  })
}
