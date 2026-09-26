import { z } from 'zod'

/**
 * Création ou modification d'un pointage par un admin (dialog de UserServices.vue). Mêmes règles
 * que le Vue (`required` natifs) : début obligatoire, fin obligatoire si « terminé » est coché.
 * Une fin antérieure au début n'est pas bloquante (simple avertissement). Messages courts en
 * français (Q-VALIDATION).
 */
export const serviceFormSchema = z
  .object({
    isBreak: z.boolean(),
    debutDate: z.string().min(1, 'Date requise'),
    debutTime: z.string().min(1, 'Heure requise'),
    /** Terminé (sinon : service ou pause en cours, sans fin) */
    hasEnd: z.boolean(),
    finDate: z.string(),
    finTime: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.hasEnd) return
    if (!values.finDate)
      ctx.addIssue({ code: 'custom', path: ['finDate'], message: 'Date requise' })
    if (!values.finTime)
      ctx.addIssue({ code: 'custom', path: ['finTime'], message: 'Heure requise' })
  })

export type ServiceFormValues = z.infer<typeof serviceFormSchema>
