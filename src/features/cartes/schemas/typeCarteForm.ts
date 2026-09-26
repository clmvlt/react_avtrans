import { z } from 'zod'

/** Formulaire de type de carte : nom d'au moins 2 caractères une fois trimé (règle du Vue). */
export const typeCarteFormSchema = z.object({
  nom: z
    .string()
    .refine((value) => value.trim().length >= 2, 'Le nom doit contenir au moins 2 caractères'),
  description: z.string(),
})

export type TypeCarteFormValues = z.infer<typeof typeCarteFormSchema>
