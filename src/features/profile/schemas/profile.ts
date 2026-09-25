import { z } from 'zod'

/**
 * Informations personnelles (/profile) : prénom et nom requis, avec les messages du Vue. Les
 * valeurs ne sont pas rognées à l'envoi, comme dans le Vue.
 */
export const profileSchema = z.object({
  firstName: z.string().refine((value) => value.trim() !== '', 'Le prénom est requis'),
  lastName: z.string().refine((value) => value.trim() !== '', 'Le nom est requis'),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
