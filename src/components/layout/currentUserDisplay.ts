import type { UserDTO } from '@/models'

/** Nom, e-mail, initiales et photo de l'utilisateur connecté, tels qu'App.vue les passait à la Navbar. */
export function getCurrentUserDisplay(user: UserDTO | null) {
  const firstInitial = user?.firstName?.charAt(0) || ''
  const lastInitial = user?.lastName?.charAt(0) || ''

  return {
    name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    initials: (firstInitial + lastInitial).toUpperCase() || '?',
    image: user?.pictureUrl,
  }
}
