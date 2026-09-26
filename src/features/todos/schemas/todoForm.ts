import { z } from 'zod'

/** Formulaire de tâche : titre non vide une fois trimé (bouton désactivé sinon, comme le Vue). */
export const todoFormSchema = z.object({
  title: z.string().refine((value) => value.trim().length > 0, 'Le titre est requis'),
  description: z.string(),
  categoryUuid: z.string(),
})

export type TodoFormValues = z.infer<typeof todoFormSchema>
