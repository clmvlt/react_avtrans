import { z } from 'zod'

/**
 * Règles communes aux formulaires d'auth. Le Vue s'appuyait sur la validation native
 * (`type="email"`, `required`) et sur quelques contrôles à la soumission ; les formulaires React
 * sont en `noValidate` et reprennent ces mêmes règles avec des messages courts en français
 * (décision Q-VALIDATION).
 */

export const PASSWORD_MIN_LENGTH = 6
export const PASSWORD_MIN_MESSAGE = 'Le mot de passe doit contenir au moins 6 caractères'
export const PASSWORD_MISMATCH_MESSAGE = 'Les mots de passe ne correspondent pas'

/** Champ `type="email"` requis : même format que la validation native du navigateur. */
export const emailField = z
  .string()
  .min(1, 'Veuillez entrer votre adresse email')
  .regex(z.regexes.html5Email, 'Adresse email invalide')
