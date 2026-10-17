import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import type { UserContractComparisonDTO, UsersContractComparisonListResponse } from '@/models'
import { usersService } from '@/services'
import { hoursKeys } from './queryKeys'

export type ContractComparisonData = {
  comparisons: UserContractComparisonDTO[]
  /** Jours ouvrés restants du mois (D10), null si l'API ne les renvoie pas encore. */
  joursOuvresRestants: number | null
  /** Réception de la réponse (`performance.now()`) : base des compteurs en direct (D12). */
  receivedAt: number
}

const toComparisonData = ({
  data,
  receivedAt,
}: Received<UsersContractComparisonListResponse>): ContractComparisonData => ({
  comparisons: data.users ?? [],
  joursOuvresRestants: data.joursOuvresRestants ?? null,
  receivedAt,
})

/**
 * Heures contrat / heures effectuées de chaque employé pour un mois (GET /users/contract-hours).
 * Le mois précédent reste affiché pendant le chargement du suivant.
 */
export function useContractComparisonQuery(year: number, month: number) {
  return useQuery({
    queryKey: hoursKeys.contractComparison(year, month),
    queryFn: () => receive(usersService.getContractComparison(year, month)),
    select: toComparisonData,
    placeholderData: keepPreviousData,
    ...liveQueryOptions,
  })
}
