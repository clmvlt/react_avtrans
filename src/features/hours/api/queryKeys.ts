import { usersKeys } from '@/features/users/api/queryKeys'

/** Clés des heures (GET /users/hours, GET /users/contract-hours), sous la racine `['users']`. */
export const hoursKeys = {
  usersWithHours: () => [...usersKeys.all, 'hours'] as const,
  contractComparison: (year: number, month: number) =>
    [...usersKeys.all, 'contract-hours', { year, month }] as const,
}
