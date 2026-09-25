import { z } from 'zod'

/**
 * Dialog « Nouvelle version ». Mêmes règles que le Vue : bouton actif seulement avec un APK lu,
 * un code > 0 et un nom non vide (le fichier est géré hors du formulaire) ; le code est entier
 * (`step` natif du champ nombre). Le nom n'est pas rogné à l'envoi, comme dans le Vue.
 */
export const createAppVersionSchema = z.object({
  versionCode: z
    .number({ error: 'Le code de version est requis' })
    .int('Le code de version doit être un nombre entier')
    .positive('Le code de version doit être supérieur à 0'),
  versionName: z.string().refine((value) => value.trim() !== '', 'Le nom de version est requis'),
  changelog: z.string(),
})

export type CreateAppVersionFormValues = z.infer<typeof createAppVersionSchema>

/** Dialog « Modifier la version » : aucune règle dans le Vue. */
export const editAppVersionSchema = z.object({
  changelog: z.string(),
  isActive: z.boolean(),
})

export type EditAppVersionFormValues = z.infer<typeof editAppVersionSchema>
