/** Clés TanStack Query du domaine utilisateurs. */
export const usersKeys = {
  all: ['users'] as const,
  /** GET /users (masqués compris) : page Utilisateurs et badge « en attente » de la navbar */
  list: () => [...usersKeys.all, 'list'] as const,
  /** GET /users/{uuid} */
  detail: (uuid: string) => [...usersKeys.all, 'detail', uuid] as const,
  /** GET /users/status : suivi des présences (rafraîchi toutes les 10 s) */
  status: () => [...usersKeys.all, 'status'] as const,
  /** GET /users/last-vehicles : dernier véhicule de chaque utilisateur */
  lastVehicles: () => [...usersKeys.all, 'last-vehicles'] as const,
}
