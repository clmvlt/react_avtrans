import { z } from 'zod'

/** Formulaire de catégorie de stock : nom requis (`required` natif du Vue), description libre. */
export const stockCategorySchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string(),
})

export type StockCategoryFormValues = z.infer<typeof stockCategorySchema>
