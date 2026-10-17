import type { HoursQueryParams } from '@/services/userServices'
import type { AdminServiceFilters } from '../lib/serviceFilters'

/**
 * Clés TanStack Query des pointages d'un employé côté admin (`/services/admin/*`).
 * L'historique des modifications d'un pointage a ses propres clés (`serviceHistoryKeys`, feature
 * service-history), sous la même racine `['services', 'admin']` (voir `invalidateUserServices`).
 */
export const adminServicesKeys = {
  all: ['services', 'admin'] as const,
  /** Toutes les pages de pointages d'un employé (POST /services/admin/user/{uuid}) */
  userServices: (userUuid: string) => [...adminServicesKeys.all, 'user', userUuid] as const,
  userServicesPage: (userUuid: string, filters: AdminServiceFilters, page: number) =>
    [...adminServicesKeys.userServices(userUuid), { ...filters, page }] as const,
  /** Pointage en cours d'un employé (GET /services/admin/{uuid}/active) */
  active: (userUuid: string) => [...adminServicesKeys.all, 'active', userUuid] as const,
  /** Heures travaillées, toutes périodes confondues (GET /services/admin/hours/{uuid}) */
  userHours: (userUuid: string) => [...adminServicesKeys.all, 'hours', userUuid] as const,
  hours: (userUuid: string, params: HoursQueryParams) =>
    [...adminServicesKeys.userHours(userUuid), params] as const,
  /** Services de travail proposés comme service d'une pause (formulaire), autour d'une date */
  parentCandidates: (userUuid: string, date: string) =>
    [...adminServicesKeys.userServices(userUuid), 'parents', date] as const,
}
