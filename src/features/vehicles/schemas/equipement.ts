import { z } from 'zod'
import type { VehiculeEquipementDTO } from '@/models'

/**
 * Équipement (VehiculeEquipementModal.vue) : nom non vide après trim ; quantité vide = 1, sinon
 * entier ≥ 1 (validation native `min="1"` du Vue) ; commentaire facultatif, envoyé sans espaces.
 */
export const equipementFormSchema = z.object({
  nom: z.string().trim().min(1, 'Veuillez saisir un nom'),
  quantite: z
    .string()
    .refine(
      (value) => value === '' || (Number.isInteger(Number(value)) && Number(value) >= 1),
      'La quantité doit être un entier supérieur ou égal à 1',
    ),
  commentaire: z.string().trim(),
})

export type EquipementFormValues = z.infer<typeof equipementFormSchema>

export function equipementToFormValues(
  equipement: VehiculeEquipementDTO | null,
): EquipementFormValues {
  if (!equipement) return { nom: '', quantite: '1', commentaire: '' }
  return {
    nom: equipement.nom || '',
    quantite: String(equipement.quantite ?? 1),
    commentaire: equipement.commentaire || '',
  }
}

/** Quantité envoyée : un champ vidé vaut 1, comme le Vue. */
export const toQuantite = (value: string) => (value === '' ? 1 : Number(value))
