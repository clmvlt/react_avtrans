import { z } from 'zod'

/**
 * Règles des formulaires d'entretien = celles du Vue (Q-VALIDATION) : seuls la date et le
 * kilométrage sont requis (`required` natif). Le kilométrage est un entier et le coût a au plus
 * deux décimales (pas `step` par défaut et `step="0.01"` des champs natifs). Le véhicule et le
 * type, marqués d'un astérisque, ne sont pas validés dans le Vue : un envoi sans type échoue côté
 * API (toast d'erreur), et le type vidé par le bug B-05 est envoyé tel quel.
 */
const dateField = z.string().min(1, 'La date est obligatoire')

const kilometrageField = z
  .string()
  .min(1, 'Le kilométrage est obligatoire')
  .refine((value) => Number.isInteger(Number(value)), 'Nombre entier attendu')

const coutField = z.string().refine((value) => {
  if (value === '') return true
  const cents = Number(value) * 100
  return Math.abs(cents - Math.round(cents)) < 1e-6
}, 'Deux décimales au maximum')

/** Formulaire d'Entretiens.vue (véhicule, sélecteur dossier › type). */
export const fleetEntretienFormSchema = z.object({
  vehiculeId: z.string(),
  dossierId: z.string(),
  typeEntretienId: z.string(),
  dateEntretien: dateField,
  kilometrage: kilometrageField,
  cout: coutField,
  commentaire: z.string(),
})

export type FleetEntretienFormValues = z.infer<typeof fleetEntretienFormSchema>

/** Formulaire d'EntretiensVehicule.vue (véhicule fixé par l'URL, liste de types à plat). */
export const vehiculeEntretienFormSchema = z.object({
  typeEntretienId: z.string(),
  dateEntretien: dateField,
  kilometrage: kilometrageField,
  cout: coutField,
  commentaire: z.string(),
})

export type VehiculeEntretienFormValues = z.infer<typeof vehiculeEntretienFormSchema>
