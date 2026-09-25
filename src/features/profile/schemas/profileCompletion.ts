import { z } from 'zod'

/**
 * Dialog de complétion du profil. Aucune règle, comme le Vue : des valeurs vides peuvent être
 * enregistrées (le dialog réapparaît alors à la prochaine arrivée dans l'application).
 */
export const profileCompletionSchema = z.object({
  driverLicenseNumber: z.string(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
})

export type ProfileCompletionFormValues = z.infer<typeof profileCompletionSchema>
