import { z } from 'zod'

/**
 * Changement de mot de passe (/profile) : règles et messages de `validatePassword` du Vue.
 * Tous les contrôles sont faits en une passe, pour afficher les trois erreurs à la fois comme le Vue.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.currentPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: 'Le mot de passe actuel est requis',
      })
    }

    if (!values.newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'Le nouveau mot de passe est requis',
      })
    } else if (values.newPassword.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'Le mot de passe doit contenir au moins 8 caractères',
      })
    }

    if (!values.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'La confirmation est requise',
      })
    } else if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Les mots de passe ne correspondent pas',
      })
    }
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
