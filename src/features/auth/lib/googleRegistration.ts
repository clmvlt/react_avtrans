import type { GoogleProfile } from '@/models'

/**
 * Relais en mémoire entre l'étape 1 Google (POST /auth/google → NEEDS_REGISTRATION) et la page
 * de création de compte /register/google (useGoogleRegistration du Vue).
 *
 * Volontairement NON persisté (ni URL, ni localStorage, ni `history.state`) :
 * - l'idToken Google est sensible et valide moins d'une heure ;
 * - un rechargement de la page de création doit vider l'état et renvoyer au login
 *   (impossible de régénérer le token sans repasser par le bouton Google).
 *
 * Simple état de module : la page le lit une fois à son montage, aucun composant n'a besoin
 * d'être notifié de ses changements. Comme dans le Vue, il n'est pas vidé à la déconnexion.
 */

export type GoogleRegistration = {
  idToken: string
  profile: GoogleProfile
}

let registration: GoogleRegistration | null = null

export function setRegistration(idToken: string, profile: GoogleProfile): void {
  registration = { idToken, profile }
}

export function clearRegistration(): void {
  registration = null
}

/** Relais courant, ou `null` si aucune inscription Google n'est en cours. */
export function getRegistration(): GoogleRegistration | null {
  return registration && registration.idToken ? registration : null
}
