import { z } from 'zod'

/** Type d'entretien (TypesEntretien.vue) : seul le nom est requis. */
export const typeEntretienFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  description: z.string(),
  dossierId: z.string(),
})

export type TypeEntretienFormValues = z.infer<typeof typeEntretienFormSchema>

/** Dossier de types d'entretien (TypesEntretien.vue) : seul le nom est requis. */
export const dossierFormSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  description: z.string(),
})

export type DossierFormValues = z.infer<typeof dossierFormSchema>
