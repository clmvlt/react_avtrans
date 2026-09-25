import type { UserDTO } from '@/models'

/**
 * Fenêtre (en jours) pendant laquelle un compte récemment créé et non activé
 * est considéré « en attente d'activation ».
 */
const PENDING_WINDOW_DAYS = 7
const PENDING_WINDOW_MS = PENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000

/** Vrai si le compte a été créé il y a moins de PENDING_WINDOW_DAYS jours. */
function isRecentlyCreated(createdAt?: Date | string): boolean {
  if (!createdAt) return false
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return false
  const ageMs = Date.now() - created
  return ageMs >= 0 && ageMs <= PENDING_WINDOW_MS
}

/**
 * Un compte est « en attente d'activation » s'il n'est pas actif et qu'il a été créé récemment
 * (badge du lien « Utilisateurs » de la navbar, section d'activation de la page Utilisateurs).
 */
export function isPendingActivation(user: UserDTO): boolean {
  return user.isActive === false && isRecentlyCreated(user.createdAt)
}
