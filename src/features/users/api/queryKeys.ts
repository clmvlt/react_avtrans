/** Clés TanStack Query du domaine utilisateurs (à compléter par la feature users). */
export const usersKeys = {
  all: ['users'] as const,
  list: () => [...usersKeys.all, 'list'] as const,
  detail: (uuid: string) => [...usersKeys.all, 'detail', uuid] as const,
}
