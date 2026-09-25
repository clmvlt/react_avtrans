import { z } from 'zod'

/** Valeur de l'option « Autre (personnalisé) » du sélecteur de type. */
export const CUSTOM_ABSENCE_TYPE = 'custom'

const absenceFormShape = z.object({
  userUuid: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  period: z.string(),
  absenceTypeUuid: z.string(),
  customType: z.string(),
  reason: z.string(),
  approved: z.boolean(),
})

export type AbsenceFormValues = z.infer<typeof absenceFormShape>

type AbsenceRules = {
  /** Employé obligatoire (création admin). */
  requireUser: boolean
  /** Date de fin ≥ date de début (demande employé seulement : l'admin ne le vérifiait pas). */
  checkDateOrder: boolean
}

/**
 * Règles d'`isFormValid` du Vue (AbsenceEditModal, MyAbsenceEditModal), avec des messages courts
 * (Q-VALIDATION) : dates requises, type requis (ou texte du type personnalisé), employé en
 * création admin, fin ≥ début pour la demande employé.
 * Contrôles regroupés dans un seul `superRefine` pour que toutes les erreurs s'affichent ensemble.
 */
function absenceSchema({ requireUser, checkDateOrder }: AbsenceRules) {
  return absenceFormShape.superRefine((values, ctx) => {
    const issue = (path: keyof AbsenceFormValues, message: string) =>
      ctx.addIssue({ code: 'custom', path: [path], message })

    if (requireUser && !values.userUuid) issue('userUuid', 'Sélectionnez un employé')
    if (!values.startDate) issue('startDate', 'Date de début requise')
    if (!values.endDate) issue('endDate', 'Date de fin requise')

    if (values.absenceTypeUuid === CUSTOM_ABSENCE_TYPE) {
      if (!values.customType.trim()) issue('customType', 'Précisez le type')
    } else if (!values.absenceTypeUuid) {
      issue('absenceTypeUuid', 'Sélectionnez un type')
    }

    if (
      checkDateOrder &&
      values.startDate &&
      values.endDate &&
      new Date(values.endDate) < new Date(values.startDate)
    ) {
      issue('endDate', 'La date de fin doit suivre la date de début')
    }
  })
}

/** Création admin (« Nouvelle absence »). */
export const adminAbsenceCreateSchema = absenceSchema({ requireUser: true, checkDateOrder: false })

/** Modification admin (employé non modifiable). */
export const adminAbsenceEditSchema = absenceSchema({ requireUser: false, checkDateOrder: false })

/** Demande de l'employé (« Nouvelle demande d'absence »). */
export const myAbsenceRequestSchema = absenceSchema({ requireUser: false, checkDateOrder: true })
