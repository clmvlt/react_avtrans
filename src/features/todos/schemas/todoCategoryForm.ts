import { z } from 'zod'

/**
 * Formulaire de catégorie de tâches : nom non vide une fois trimé (règle du Vue) ; la couleur
 * vient d'un `<input type="color">`, toujours au format `#rrggbb`.
 */
export const todoCategoryFormSchema = z.object({
  name: z.string().refine((value) => value.trim().length > 0, 'Le nom est requis'),
  color: z.string(),
})

export type TodoCategoryFormValues = z.infer<typeof todoCategoryFormSchema>
