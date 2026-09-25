import { z } from 'zod'
import { emailField } from './fields'

/** Mot de passe oublié : adresse requise (« Veuillez entrer votre adresse email » du Vue). */
export const forgotPasswordSchema = z.object({
  email: emailField,
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
