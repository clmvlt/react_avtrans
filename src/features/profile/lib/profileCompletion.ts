import type { UserDTO } from '@/models'
import { selectIsActive, selectIsEmailVerified, useAuthStore } from '@/stores/auth-store'

type AuthState = ReturnType<typeof useAuthStore.getState>

/** Adresse complète : rue, ville et code postal (le pays n'est pas exigé). */
export function hasCompleteAddress(user: UserDTO | null | undefined): boolean {
  const address = user?.address
  return !!(address?.street && address?.city && address?.postalCode)
}

/** Numéro de permis de conduire renseigné. */
export function hasDriverLicense(user: UserDTO | null | undefined): boolean {
  return !!user?.driverLicenseNumber
}

/**
 * Sélecteur du store : profil à compléter (adresse ou permis manquant) pour un compte connecté,
 * vérifié et actif. Même condition que `needsProfileCompletion` d'App.vue.
 */
export function selectNeedsProfileCompletion(state: AuthState): boolean {
  const { user } = state
  if (!user) return false
  if (!selectIsEmailVerified(state) || !selectIsActive(state)) return false
  return !hasCompleteAddress(user) || !hasDriverLicense(user)
}
