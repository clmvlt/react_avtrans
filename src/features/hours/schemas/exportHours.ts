import { z } from 'zod'

/**
 * Export des heures (ExportHours.vue) : mêmes règles que la validation native du Vue (dates
 * `required`, début `max` = fin, fin `min` = début) et bouton désactivé sans utilisateur
 * sélectionné ; messages courts en français (Q-VALIDATION). Le formulaire est en `noValidate`.
 */
export const exportHoursSchema = z
  .object({
    startDate: z.string().min(1, 'Date de début requise'),
    endDate: z.string().min(1, 'Date de fin requise'),
    userUuids: z.array(z.string()).min(1, 'Veuillez sélectionner au moins un utilisateur'),
  })
  .refine((values) => !values.startDate || !values.endDate || values.startDate <= values.endDate, {
    message: 'La date de début doit précéder la date de fin',
    path: ['startDate'],
  })

export type ExportHoursFormValues = z.infer<typeof exportHoursSchema>
