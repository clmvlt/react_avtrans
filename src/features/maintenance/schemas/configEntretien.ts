import { z } from 'zod'

const PERIODICITE_ERROR = 'Veuillez saisir une valeur de périodicité valide'

/**
 * Configuration d'entretien d'un véhicule (ConfigEntretienModal.vue). Mêmes règles que le Vue :
 * type obligatoire à la création, valeur requise et strictement positive (messages du Vue), avec
 * les contraintes du champ natif `min="1"` (pas de 1 : entier). La valeur n'est pas remise à zéro
 * quand on passe de km à jours (bug B-27 reproduit).
 */
export function createConfigEntretienSchema(isEdit: boolean) {
  return z.object({
    typeEntretienId: isEdit
      ? z.string()
      : z.string().min(1, "Veuillez sélectionner un type d'entretien"),
    periodiciteType: z.enum(['KILOMETRAGE', 'TEMPOREL']),
    periodiciteValeur: z.string().refine((value) => {
      const number = Number(value)
      return value !== '' && Number.isInteger(number) && number >= 1
    }, PERIODICITE_ERROR),
    actif: z.boolean(),
  })
}

export type ConfigEntretienFormValues = z.infer<ReturnType<typeof createConfigEntretienSchema>>
