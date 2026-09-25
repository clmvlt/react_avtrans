import { USER_ROLE_UUIDS } from '@/enums'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { selectIsAuthenticated, selectRoleUuid, useAuthStore } from '@/stores/auth-store'
import { changelog, type ChangeRole, type ChangelogEntry } from '../data/changelog'

/** Clé localStorage identique au Vue */
const CHANGELOG_STORAGE_KEY = 'changelog_last_seen_version'

type UserRoleKey = 'admin' | 'mechanic' | 'user'

/**
 * Visibilité des changements selon le rôle (réel, pas la « vue utilisateur ») :
 * l'admin voit tout, le mécanicien voit mécanicien + utilisateur + tous, l'utilisateur voit
 * utilisateur + tous.
 */
const ROLE_HIERARCHY: Record<UserRoleKey, ChangeRole[]> = {
  admin: ['all', 'user', 'mechanic', 'admin'],
  mechanic: ['all', 'user', 'mechanic'],
  user: ['all', 'user'],
}

function getRoleKey(roleUuid: string | null): UserRoleKey {
  if (roleUuid === USER_ROLE_UUIDS.ADMINISTRATEUR) return 'admin'
  if (roleUuid === USER_ROLE_UUIDS.MECANICIEN) return 'mechanic'
  return 'user'
}

/** Dernière entrée du changelog réduite aux changements visibles ; null si rien pour ce rôle. */
function getLatestEntry(roleKey: UserRoleKey): ChangelogEntry | null {
  const latest = changelog[0]
  if (!latest) return null
  const allowedRoles = ROLE_HIERARCHY[roleKey]
  const changes = latest.changes.filter((change) => allowedRoles.includes(change.role))
  if (changes.length === 0) return null
  return { ...latest, changes }
}

/**
 * Nouveautés de la dernière version, filtrées par rôle, et suivi de la dernière version vue
 * (localStorage, synchronisé entre la navbar et le dialog).
 */
export function useChangelog() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const roleUuid = useAuthStore(selectRoleUuid)
  const [lastSeenVersion, setLastSeenVersion] = useLocalStorage(CHANGELOG_STORAGE_KEY)

  const latestEntry = getLatestEntry(getRoleKey(roleUuid))
  const latestVersion = changelog[0]?.version ?? null
  // Connecté, avec des changements visibles pour ce rôle, et version différente de la dernière vue
  const hasUnseenChanges =
    isAuthenticated &&
    latestVersion !== null &&
    latestEntry !== null &&
    lastSeenVersion !== latestVersion

  const markAsSeen = () => {
    if (latestVersion) setLastSeenVersion(latestVersion)
  }

  return { latestEntry, latestVersion, hasUnseenChanges, markAsSeen }
}
