/** Clés TanStack Query des signatures (racine `['signatures']`). */
export const signaturesKeys = {
  all: ['signatures'] as const,
  /** [ADMIN] GET /signatures/all-users : chaque utilisateur avec sa dernière signature. */
  allUsers: () => [...signaturesKeys.all, 'all-users'] as const,
  /** [ADMIN] historiques par utilisateur (préfixe de `user(uuid)`). */
  users: () => [...signaturesKeys.all, 'user'] as const,
  /** [ADMIN] GET /signatures/user/{uuid}. */
  user: (uuid: string) => [...signaturesKeys.users(), uuid] as const,
  /** GET /signatures/last/summary : rappel de signature de l'utilisateur connecté. */
  summary: () => [...signaturesKeys.all, 'me', 'summary'] as const,
}
