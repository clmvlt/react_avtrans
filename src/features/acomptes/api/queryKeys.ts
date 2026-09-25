import type { AcompteSearchParams } from '@/services'

/** Clés TanStack Query des acomptes. */
export const acompteKeys = {
  all: ['acomptes'] as const,
  /** Recherche admin (POST /acomptes/admin/search), une entrée par jeu de filtres + page. */
  adminList: (params: AcompteSearchParams) =>
    [...acompteKeys.all, 'admin', 'list', params] as const,
  /** Mes demandes (POST /acomptes/my), une entrée par jeu de filtres + page. */
  myList: (params: AcompteSearchParams) => [...acompteKeys.all, 'my', 'list', params] as const,
}
