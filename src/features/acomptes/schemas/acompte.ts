import { z } from 'zod'

/**
 * Montant saisi (texte du champ `type="number"`) : règles effectives du Vue, validation native
 * comprise (`min`, `step="0.01"`), avec des messages courts (Q-VALIDATION).
 */
function montantField(minimum: number, minimumMessage: string) {
  return z.string().superRefine((raw, ctx) => {
    const value = Number(raw)
    if (raw.trim() === '' || Number.isNaN(value)) {
      ctx.addIssue({ code: 'custom', message: 'Montant requis' })
      return
    }
    if (minimum > 0 ? value < minimum : value <= 0) {
      ctx.addIssue({ code: 'custom', message: minimumMessage })
      return
    }
    if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) {
      ctx.addIssue({ code: 'custom', message: '2 décimales maximum' })
    }
  })
}

/** Création admin : employé requis, montant > 0 (« Nouvel acompte »). */
export const adminAcompteCreateSchema = z.object({
  userUuid: z.string().min(1, 'Sélectionnez un employé'),
  montant: montantField(0, 'Le montant doit être supérieur à 0'),
  raison: z.string(),
  approved: z.boolean(),
})

export type AdminAcompteCreateValues = z.infer<typeof adminAcompteCreateSchema>

/**
 * Demande de l'employé : montant d'au moins 1 € (`min="1"` natif du Vue, plus strict que son
 * contrôle `> 0`).
 */
export const myAcompteRequestSchema = z.object({
  montant: montantField(1, 'Le montant minimum est de 1 €'),
  raison: z.string(),
})

export type MyAcompteRequestValues = z.infer<typeof myAcompteRequestSchema>
