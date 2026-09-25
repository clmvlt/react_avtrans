import { z } from 'zod'

/**
 * Création d'une couchette par un admin : même règle que le Vue (employé obligatoire, date
 * facultative, vide = aujourd'hui côté serveur).
 */
export const couchetteCreateSchema = z.object({
  userUuid: z.string().min(1, 'Sélectionnez un employé'),
  date: z.string(),
})

export type CouchetteCreateFormValues = z.infer<typeof couchetteCreateSchema>
