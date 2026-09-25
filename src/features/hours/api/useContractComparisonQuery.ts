import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UsersContractComparisonListResponse } from '@/models'
import { usersService } from '@/services'
import { hoursKeys } from './queryKeys'

const toComparisons = (response: UsersContractComparisonListResponse) => response.users ?? []

/**
 * Heures contrat / heures effectuées de chaque employé pour un mois (GET /users/contract-hours).
 * Le mois précédent reste affiché pendant le chargement du suivant.
 */
export function useContractComparisonQuery(year: number, month: number) {
  return useQuery({
    queryKey: hoursKeys.contractComparison(year, month),
    queryFn: () => usersService.getContractComparison(year, month),
    select: toComparisons,
    placeholderData: keepPreviousData,
  })
}
