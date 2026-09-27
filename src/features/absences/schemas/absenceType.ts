import { z } from 'zod'

/**
 * Type d'absence : nom requis (après `trim`), couleur `#RRGGBB` (règle du `pattern` natif du
 * Vue ; `color + '20'` en dépend partout pour le fond des badges), réglages d'heures (D8).
 */
export const absenceTypeSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Format attendu : #RRGGBB'),
  modeDecompte: z.enum(['JOURS_OUVRABLES', 'JOURS_OUVRES', 'JOURS_CALENDAIRES']),
  compteHeures: z.boolean(),
})

export type AbsenceTypeFormValues = z.input<typeof absenceTypeSchema>
