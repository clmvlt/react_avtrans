import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UserContractComparisonDTO, UsersContractComparisonListResponse } from '@/models'
import { usersService } from '@/services'
import { hoursKeys } from './queryKeys'

export type ContractComparisonData = {
  comparisons: UserContractComparisonDTO[]
  /** Jours ouvrés restants du mois (D10), null si l'API ne les renvoie pas encore. */
  joursOuvresRestants: number | null
}

const toComparisonData = (
  response: UsersContractComparisonListResponse,
): ContractComparisonData => ({
  comparisons: response.users ?? [],
  joursOuvresRestants: response.joursOuvresRestants ?? null,
})

/**
 * Heures contrat / heures effectuées de chaque employé pour un mois (GET /users/contract-hours).
 * Le mois précédent reste affiché pendant le chargement du suivant.
 */
export function useContractComparisonQuery(year: number, month: number) {
  return useQuery({
    queryKey: hoursKeys.contractComparison(year, month),
    queryFn: () => usersService.getContractComparison(year, month),
    select: toComparisonData,
    placeholderData: keepPreviousData,
  })
}
