import { usersKeys } from '@/features/users/api/queryKeys'

/** Clés des heures (GET /users/hours, GET /users/contract-hours), sous la racine `['users']`. */
export const hoursKeys = {
  usersWithHours: () => [...usersKeys.all, 'hours'] as const,
  /** Toutes les comparaisons au contrat (invalidées quand les heures d'une absence changent). */
  contractComparisons: () => [...usersKeys.all, 'contract-hours'] as const,
  contractComparison: (year: number, month: number) =>
    [...hoursKeys.contractComparisons(), { year, month }] as const,
}
