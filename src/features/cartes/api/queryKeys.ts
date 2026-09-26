/** Clés TanStack Query des cartes. */
export const cartesKeys = {
  all: ['cartes'] as const,
  list: () => [...cartesKeys.all, 'list'] as const,
  detail: (uuid: string) => [...cartesKeys.all, 'detail', uuid] as const,
}

/** Clés TanStack Query des types de cartes. */
export const typeCartesKeys = {
  all: ['type-cartes'] as const,
  list: () => [...typeCartesKeys.all, 'list'] as const,
  detail: (uuid: string) => [...typeCartesKeys.all, 'detail', uuid] as const,
}
