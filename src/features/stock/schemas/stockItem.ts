import { z } from 'zod'

/** Prix au centime près : équivalent du `step="0.01"` natif du Vue. */
const hasAtMostTwoDecimals = (value: number) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-7

/**
 * Formulaire d'article. Le Vue s'appuyait sur la validation native : `required` sur la référence,
 * le nom et la quantité (`type="number"` sans `step`, donc entier, **sans minimum** : une quantité
 * négative reste acceptée), `min="0"` et `step="0.01"` sur le prix. Mêmes règles ici
 * (Q-VALIDATION) ; les nombres restent des chaînes, comme la valeur d'un `<input type="number">`.
 */
export const stockItemSchema = z.object({
  reference: z.string().min(1, 'La référence est requise'),
  nom: z.string().min(1, 'Le nom est requis'),
  description: z.string(),
  quantite: z
    .string()
    .min(1, 'La quantité est requise')
    .refine((value) => Number.isInteger(Number(value)), 'La quantité doit être un nombre entier'),
  prixUnitaire: z
    .string()
    .refine((value) => value === '' || Number(value) >= 0, 'Le prix ne peut pas être négatif')
    .refine(
      (value) => value === '' || hasAtMostTwoDecimals(Number(value)),
      'Le prix ne peut avoir que deux décimales',
    ),
  unite: z.string(),
  categoryId: z.string(),
})

export type StockItemFormValues = z.infer<typeof stockItemSchema>
