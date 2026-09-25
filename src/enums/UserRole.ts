/**
 * User role for role-based access control (RBAC)
 * Les valeurs correspondent exactement aux noms stockés en base de données
 *
 * UUIDs des rôles :
 * - Utilisateur: 99127dd5-f7bd-446c-9fd0-c05d4ea135b2
 * - Administrateur: c10523af-a4ab-47e2-8025-5ef4e241ef08
 * - Mécanicien: ccbd448a-0eef-4277-b53b-91be340b080f
 */
export enum UserRole {
  UTILISATEUR = 'Utilisateur',
  MECANICIEN = 'Mécanicien',
  ADMINISTRATEUR = 'Administrateur'
}

/**
 * UUIDs des rôles (pour comparaison directe avec la base de données)
 */
export const USER_ROLE_UUIDS = {
  UTILISATEUR: '99127dd5-f7bd-446c-9fd0-c05d4ea135b2',
  ADMINISTRATEUR: 'c10523af-a4ab-47e2-8025-5ef4e241ef08',
  MECANICIEN: 'ccbd448a-0eef-4277-b53b-91be340b080f'
} as const

/**
 * Couleurs des rôles (pour affichage)
 */
export const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.UTILISATEUR]: '#3b0764',
  [UserRole.ADMINISTRATEUR]: '#991b1b',
  [UserRole.MECANICIEN]: '#075985'
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.UTILISATEUR]: 'Utilisateur',
  [UserRole.MECANICIEN]: 'Mécanicien',
  [UserRole.ADMINISTRATEUR]: 'Administrateur'
}
