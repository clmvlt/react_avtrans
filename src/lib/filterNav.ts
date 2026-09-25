import type { NavLinkConfig, NavSectionConfig } from '@/config/navConfig'
import type { UserRole } from '@/enums'

/** `canAccess` de usePermissions : rôles (vue utilisateur comprise) et permissions spéciales */
type CanAccess = (requiredRoles?: UserRole[], requiredPermissions?: string[]) => boolean

/**
 * Un lien de navigation est visible si l'utilisateur a le rôle et les permissions requis, puis,
 * si le lien est réservé à certains e-mails (`requiredEmails`), si son e-mail en fait partie.
 * Filtrage identique à la Navbar du Vue (liens principaux et panneau latéral).
 */
export function isNavLinkVisible(
  link: NavLinkConfig,
  canAccess: CanAccess,
  userEmail: string | null | undefined,
): boolean {
  if (!canAccess(link.requiredRoles, link.requiredPermissions)) return false
  if (link.requiredEmails?.length) return !!userEmail && link.requiredEmails.includes(userEmail)
  return true
}

/** Liens visibles, dans l'ordre de la configuration. */
export function filterNavLinks(
  links: NavLinkConfig[],
  canAccess: CanAccess,
  userEmail: string | null | undefined,
): NavLinkConfig[] {
  return links.filter((link) => isNavLinkVisible(link, canAccess, userEmail))
}

/** Sections du panneau latéral réduites à leurs liens visibles ; les sections vides disparaissent. */
export function filterNavSections(
  sections: NavSectionConfig[],
  canAccess: CanAccess,
  userEmail: string | null | undefined,
): NavSectionConfig[] {
  return sections
    .map((section) => ({ ...section, links: filterNavLinks(section.links, canAccess, userEmail) }))
    .filter((section) => section.links.length > 0)
}
