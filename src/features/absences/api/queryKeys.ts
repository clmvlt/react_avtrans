import type { AbsenceDecompteRequest, AbsenceSearchParams } from '@/services'

/** Clés TanStack Query des absences et des types d'absence (à compléter par la feature absences). */
export const absenceKeys = {
  all: ['absences'] as const,
  /** Recherche admin (POST /absences/admin/search), une entrée par jeu de filtres + page. */
  adminList: (params: AbsenceSearchParams) =>
    [...absenceKeys.all, 'admin', 'list', params] as const,
  /** Mes demandes (POST /absences/my), une entrée par jeu de filtres + page. */
  myList: (params: AbsenceSearchParams) => [...absenceKeys.all, 'my', 'list', params] as const,
  /** Aperçu du décompte (D8) : `my` (POST /absences/decompte) ou `admin` (avec userUuid). */
  decompte: (scope: 'my' | 'admin', params: AbsenceDecompteRequest) =>
    [...absenceKeys.all, 'decompte', scope, params] as const,
}

export const absenceTypeKeys = {
  all: ['absence-types'] as const,
  list: () => [...absenceTypeKeys.all, 'list'] as const,
}
