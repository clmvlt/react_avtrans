import type { CouchetteSearchParams } from '@/services'

/** Clés TanStack Query des couchettes (racine `['couchettes']`, invalidée par chaque mutation). */
export const couchettesKeys = {
  all: ['couchettes'] as const,
  /** [ADMIN] POST /couchettes/admin/search */
  admin: (params: CouchetteSearchParams) => [...couchettesKeys.all, 'admin', params] as const,
  /** GET /couchettes/me */
  mine: (params: { page: number; size: number }) => [...couchettesKeys.all, 'me', params] as const,
}
