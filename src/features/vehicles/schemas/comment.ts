import { z } from 'zod'

/** Commentaire d'un véhicule : non vide après trim, envoyé sans espaces (VehiculeDetail.vue:1092). */
export const commentFormSchema = z.object({
  comment: z.string().trim().min(1, 'Veuillez entrer un commentaire'),
})

export type CommentFormValues = z.infer<typeof commentFormSchema>
