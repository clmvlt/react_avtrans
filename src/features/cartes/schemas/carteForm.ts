import { z } from 'zod'

/**
 * Formulaire de carte. Mêmes règles que le Vue (bouton désactivé tant qu'elles ne sont pas
 * remplies) : nom d'au moins 2 caractères et code PIN d'au moins 4 caractères une fois trimés
 * (aucun contrôle de chiffres malgré l'aide « Code à 4 chiffres »), type obligatoire.
 */
export const carteFormSchema = z.object({
  nom: z
    .string()
    .refine((value) => value.trim().length >= 2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string(),
  numero: z.string(),
  code: z
    .string()
    .refine((value) => value.trim().length >= 4, 'Le code PIN doit contenir au moins 4 caractères'),
  dateExpiration: z.string(),
  typeCarteUuid: z.string().min(1, 'Le type de carte est obligatoire'),
  userUuid: z.string(),
})

export type CarteFormValues = z.infer<typeof carteFormSchema>
