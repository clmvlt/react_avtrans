/** Clés TanStack Query du domaine véhicules (à compléter par la feature vehicles). */
export const vehiclesKeys = {
  all: ['vehicles'] as const,
  list: () => [...vehiclesKeys.all, 'list'] as const,
  detail: (id: string) => [...vehiclesKeys.all, 'detail', id] as const,
}
