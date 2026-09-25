import { z } from 'zod'

const INVALID_KM_MESSAGE = 'Veuillez entrer un kilométrage valide'

/**
 * Saisie du kilométrage (dialog de Pointage). Mêmes règles que le Vue : véhicule requis, et
 * kilométrage entier strictement positif (validation native `required min="0"` + pas de 1 de
 * l'`<input type="number">`, puis contrôle `> 0` à la soumission). Mêmes messages que le Vue.
 */
export const kilometrageSchema = z.object({
  vehiculeId: z.string().min(1, 'Veuillez sélectionner un véhicule'),
  km: z.string().refine((value) => {
    const km = Number(value)
    return value.trim() !== '' && Number.isInteger(km) && km > 0
  }, INVALID_KM_MESSAGE),
})

export type KilometrageFormValues = z.infer<typeof kilometrageSchema>

/** Relevé envoyé à l'API. */
export type KilometrageInput = {
  vehiculeId: string
  km: number
}
