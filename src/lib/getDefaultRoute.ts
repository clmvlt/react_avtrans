import { USER_ROLE_UUIDS } from '@/enums'

/**
 * Route d'accueil selon le rôle (définition unique ; le Vue la recopiait dans le router,
 * Login, Register et la Navbar) : admin → /users, mécanicien → /vehicules, sinon → /pointage.
 */
export function getDefaultRoute(roleUuid: string | null | undefined): string {
  if (roleUuid === USER_ROLE_UUIDS.ADMINISTRATEUR) return '/users'
  if (roleUuid === USER_ROLE_UUIDS.MECANICIEN) return '/vehicules'
  return '/pointage'
}
