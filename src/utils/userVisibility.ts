import type { UserDTO } from '@/models'

/**
 * Indique si un utilisateur est visible dans les listes admin (services,
 * planning, heures, signatures, véhicules).
 *
 * Règle du contrat API : `isVisible` absent (ancienne version d'API) ⇒ `true`.
 * Seul `false` explicite masque l'utilisateur.
 */
export function isUserVisible(user: Pick<UserDTO, 'isVisible'> | null | undefined): boolean {
  return user?.isVisible !== false
}

/**
 * Filtre la liste renvoyée par GET /users (qui contient aussi les masqués)
 * pour un sélecteur d'utilisateur lié aux services / planning / heures /
 * absences / acomptes / couchettes / véhicules / export.
 *
 * `keepUuids` : UUID à conserver même si l'utilisateur est masqué — typiquement
 * la valeur déjà sélectionnée ou enregistrée (filtre pré-rempli par l'URL, carte
 * déjà attribuée…) afin que le sélecteur puisse toujours afficher son libellé.
 *
 * À ne PAS utiliser pour les sélecteurs d'administration des comptes
 * (changement de rôle, email, suppression) : ceux-ci doivent voir tout le monde.
 */
export function selectableUsers<T extends Pick<UserDTO, 'uuid' | 'isVisible'>>(
  users: readonly T[] | null | undefined,
  keepUuids: ReadonlyArray<string | null | undefined> = []
): T[] {
  if (!Array.isArray(users)) return []
  const keep = new Set(keepUuids.filter((uuid): uuid is string => !!uuid))
  return users.filter(user => isUserVisible(user) || (!!user.uuid && keep.has(user.uuid)))
}
