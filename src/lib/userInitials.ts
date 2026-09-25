/** Forme minimale d'une personne pour calculer ses initiales (UserDTO, user d'une absence…). */
export type InitialsSource = {
  firstName?: string | null
  lastName?: string | null
}

/**
 * Initiales d'un utilisateur : première lettre du prénom + première lettre du nom, en majuscules,
 * « ? » si les deux manquent. Même règle que les 17 copies de `getInitials` du Vue.
 *
 * @example getInitials({ firstName: 'jean', lastName: 'Dupont' }) // 'JD'
 */
export function getInitials(user: InitialsSource | null | undefined): string {
  const first = user?.firstName ? user.firstName.charAt(0).toUpperCase() : ''
  const last = user?.lastName ? user.lastName.charAt(0).toUpperCase() : ''
  return first + last || '?'
}
