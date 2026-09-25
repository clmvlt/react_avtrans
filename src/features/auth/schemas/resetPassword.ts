import { z } from 'zod'
import { PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE, PASSWORD_MISMATCH_MESSAGE } from './fields'

/**
 * Nouveau mot de passe (ResetPassword.vue) : au moins 6 caractères, puis confirmation identique.
 * Comme à la soumission du Vue, une confirmation vide est une confirmation différente.
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: PASSWORD_MISMATCH_MESSAGE,
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
