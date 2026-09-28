import { z } from 'zod'
import type { VehiculeRelaiDTO, VehiculeRelaiUpdateRequest } from '@/models'

const isKm = (value: string) => value === '' || /^\d+$/.test(value)
const KM_MESSAGE = 'Kilométrage invalide (nombre entier positif)'

/**
 * Relais (D9) : immatriculation et date de début obligatoires ; date de fin et km au retour vides
 * tant que le véhicule n'est pas revenu. Mêmes contrôles que l'API (fin ≥ début, km au retour ≥ km
 * au départ). Les km sont saisis en texte et convertis à l'envoi.
 */
export const relaiFormSchema = z
  .object({
    immat: z
      .string()
      .trim()
      .min(1, "L'immatriculation est requise")
      .max(20, '20 caractères maximum'),
    marque: z.string().trim(),
    modele: z.string().trim(),
    dateDebut: z.string().min(1, 'La date de début est requise'),
    dateFin: z.string(),
    kmDebut: z.string().trim().refine(isKm, KM_MESSAGE),
    kmFin: z.string().trim().refine(isKm, KM_MESSAGE),
    motif: z.string().trim().max(100, '100 caractères maximum'),
    commentaire: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.dateFin && values.dateDebut && values.dateFin < values.dateDebut) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateFin'],
        message: 'La date de fin doit être après la date de début',
      })
    }
    if (
      values.kmDebut &&
      values.kmFin &&
      isKm(values.kmDebut) &&
      isKm(values.kmFin) &&
      Number(values.kmFin) < Number(values.kmDebut)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['kmFin'],
        message: 'Le km au retour doit être supérieur ou égal au km au départ',
      })
    }
  })

export type RelaiFormValues = z.infer<typeof relaiFormSchema>

/** Valeurs initiales : relais modifié, ou déclaration (plaque et date de début préremplies). */
export function relaiToFormValues(
  relai: VehiculeRelaiDTO | null,
  defaults: { immat?: string; dateDebut: string },
): RelaiFormValues {
  if (!relai) {
    return {
      immat: defaults.immat ?? '',
      marque: '',
      modele: '',
      dateDebut: defaults.dateDebut,
      dateFin: '',
      kmDebut: '',
      kmFin: '',
      motif: '',
      commentaire: '',
    }
  }
  return {
    immat: relai.immat,
    marque: relai.marque ?? '',
    modele: relai.modele ?? '',
    dateDebut: relai.dateDebut,
    dateFin: relai.dateFin ?? '',
    kmDebut: relai.kmDebut != null ? String(relai.kmDebut) : '',
    kmFin: relai.kmFin != null ? String(relai.kmFin) : '',
    motif: relai.motif ?? '',
    commentaire: relai.commentaire ?? '',
  }
}

const toKm = (value: string) => (value === '' ? null : Number(value))

/** Corps complet de POST / PUT /vehicules-relais : les champs vides partent à `null`. */
export function toRelaiPayload(values: RelaiFormValues): VehiculeRelaiUpdateRequest {
  return {
    immat: values.immat.toUpperCase(),
    marque: values.marque || null,
    modele: values.modele || null,
    dateDebut: values.dateDebut,
    dateFin: values.dateFin || null,
    kmDebut: toKm(values.kmDebut),
    kmFin: toKm(values.kmFin),
    motif: values.motif || null,
    commentaire: values.commentaire || null,
  }
}

/** Corps de « Terminer le relais » : le relais tel quel, avec sa date de fin et son km au retour. */
export function toEndRelaiPayload(
  relai: VehiculeRelaiDTO,
  { dateFin, kmFin }: EndRelaiFormValues,
): VehiculeRelaiUpdateRequest {
  return {
    immat: relai.immat,
    marque: relai.marque ?? null,
    modele: relai.modele ?? null,
    dateDebut: relai.dateDebut,
    dateFin,
    kmDebut: relai.kmDebut ?? null,
    kmFin: toKm(kmFin),
    motif: relai.motif ?? null,
    commentaire: relai.commentaire ?? null,
  }
}

/**
 * « Terminer le relais » : date de fin obligatoire (pas avant le début), km au retour facultatif
 * (pas en dessous du km au départ).
 */
export function buildEndRelaiSchema(relai: Pick<VehiculeRelaiDTO, 'dateDebut' | 'kmDebut'>) {
  return z
    .object({
      dateFin: z.string().min(1, 'La date de fin est requise'),
      kmFin: z.string().trim().refine(isKm, KM_MESSAGE),
    })
    .superRefine((values, ctx) => {
      if (values.dateFin && values.dateFin < relai.dateDebut) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateFin'],
          message: 'La date de fin doit être après la date de début',
        })
      }
      if (
        values.kmFin &&
        isKm(values.kmFin) &&
        relai.kmDebut != null &&
        Number(values.kmFin) < relai.kmDebut
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['kmFin'],
          message: 'Le km au retour doit être supérieur ou égal au km au départ',
        })
      }
    })
}

export type EndRelaiFormValues = z.infer<ReturnType<typeof buildEndRelaiSchema>>
