import { z } from 'zod'
import {
  emailField,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
} from './fields'

/**
 * Inscription (Register.vue) : champs requis, mot de passe d'au moins 6 caractères et
 * confirmation identique.
 */
export const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Veuillez entrer votre prénom'),
    lastName: z.string().min(1, 'Veuillez entrer votre nom'),
    email: emailField,
    password: z.string().min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_MESSAGE),
    confirmPassword: z.string().min(1, 'Veuillez confirmer le mot de passe'),
  })
  .refine((values) => !values.confirmPassword || values.password === values.confirmPassword, {
    message: PASSWORD_MISMATCH_MESSAGE,
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
