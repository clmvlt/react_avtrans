import { z } from 'zod'

/**
 * Modification d'un compte (UserEditModal.vue). Mêmes règles que le Vue : seuls le prénom et le nom
 * sont requis (`required` natif, qui accepte une saisie d'espaces) ; les heures de contrat passent
 * par un champ `type="number"` sans borne. Messages courts en français (Q-VALIDATION).
 */
export const userEditSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  /** UUID du rôle, `''` si aucun */
  roleUuid: z.string(),
  isActive: z.boolean(),
  isCouchette: z.boolean(),
  isVisible: z.boolean(),
  /** Valeur brute du champ `type="number"` */
  heureContrat: z.string(),
  telPersonnel: z.string(),
  telPro: z.string(),
  driverLicenseNumber: z.string(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
})

export type UserEditFormValues = z.infer<typeof userEditSchema>
