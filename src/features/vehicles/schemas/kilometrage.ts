import { z } from 'zod'

/**
 * Kilométrage saisi (dialogs d'ajout et de modification de VehiculeDetail.vue). Le Vue désactivait
 * « Enregistrer » tant que la valeur était vide ou nulle (`!kmValue` : 0 refusé) et la validation
 * native de l'input (`min="0"`, pas entier) bloquait les négatifs et les décimales : entier ≥ 1.
 * Aucune comparaison avec le dernier relevé (ni côté serveur, MIGRATION.md 8.3).
 */
const kmField = z
  .string()
  .min(1, 'Veuillez saisir un kilométrage')
  .refine((value) => Number(value) > 0, 'Le kilométrage doit être supérieur à 0')
  .refine((value) => Number.isInteger(Number(value)), 'Le kilométrage doit être un nombre entier')

export const kilometrageFormSchema = z.object({
  km: kmField,
  /** Date du relevé en `datetime-local` ; vide = date actuelle (ajout) ou inchangée (modification). */
  date: z.string(),
})

export type KilometrageFormValues = z.infer<typeof kilometrageFormSchema>

/** Date `datetime-local` saisie → ISO (UTC) envoyé à l'API, comme `new Date(v).toISOString()` du Vue. */
export function toIsoDate(value: string): string | undefined {
  return value ? new Date(value).toISOString() : undefined
}
