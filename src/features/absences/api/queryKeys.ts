/** Clés TanStack Query des absences et des types d'absence (à compléter par la feature absences). */
export const absenceKeys = {
  all: ['absences'] as const,
}

export const absenceTypeKeys = {
  all: ['absence-types'] as const,
  list: () => [...absenceTypeKeys.all, 'list'] as const,
}
