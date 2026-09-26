import { z } from 'zod'

/** Même expression que UserEmailModal.vue, appliquée au texte tel que saisi. */
export const USER_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Nouvel e-mail d'un compte : non vide une fois les espaces retirés, et au format du Vue. Le Vue
 * n'affichait aucun message (bouton désactivé) ; message court ajouté (Q-VALIDATION).
 */
export const userEmailSchema = z.object({
  email: z
    .string()
    .refine(
      (value) => value.trim() !== '' && USER_EMAIL_REGEX.test(value),
      'Adresse email invalide',
    ),
})

export type UserEmailFormValues = z.infer<typeof userEmailSchema>
