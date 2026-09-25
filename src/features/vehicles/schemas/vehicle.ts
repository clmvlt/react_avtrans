import { z } from 'zod'
import type { VehiculeDTO } from '@/models'
import type { VehiculeCreateRequest, VehiculeUpdateRequest } from '@/services'

/**
 * Formulaire véhicule (création dans Vehicules.vue, édition dans VehiculeInfoCard.vue).
 * Mêmes règles que le Vue, qui se contentait de désactiver le bouton : immatriculation, marque et
 * modèle non vides (sans trim : des espaces passent) ; aucun autre contrôle (PTAC négatif accepté,
 * VIN limité à 17 caractères par l'input). Tous les champs sont des chaînes ; le PTAC est converti
 * à l'envoi.
 */
export const vehicleFormSchema = z.object({
  immat: z.string().min(1, "L'immatriculation est requise"),
  relaiImmat: z.string(),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  comment: z.string(),
  vin: z.string(),
  numeroCarteGrise: z.string(),
  dateMiseEnCirculation: z.string(),
  typeCarburant: z.string(),
  ptac: z.string(),
  numeroContratAssurance: z.string(),
  assureur: z.string(),
  dateExpirationAssurance: z.string(),
  dateProchainControleTechnique: z.string(),
})

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  immat: '',
  relaiImmat: '',
  brand: '',
  model: '',
  comment: '',
  vin: '',
  numeroCarteGrise: '',
  dateMiseEnCirculation: '',
  typeCarburant: '',
  ptac: '',
  numeroContratAssurance: '',
  assureur: '',
  dateExpirationAssurance: '',
  dateProchainControleTechnique: '',
}

/** Valeurs initiales de l'édition (VehiculeDetail.vue:611 `startEditing`). */
export function vehicleToFormValues(vehicule: VehiculeDTO): VehicleFormValues {
  return {
    immat: vehicule.immat || '',
    relaiImmat: vehicule.relaiImmat || '',
    brand: vehicule.brand || '',
    model: vehicule.model || '',
    comment: vehicule.comment || '',
    vin: vehicule.vin || '',
    numeroCarteGrise: vehicule.numeroCarteGrise || '',
    dateMiseEnCirculation: vehicule.dateMiseEnCirculation || '',
    typeCarburant: vehicule.typeCarburant || '',
    ptac: vehicule.ptac != null ? String(vehicule.ptac) : '',
    numeroContratAssurance: vehicule.numeroContratAssurance || '',
    assureur: vehicule.assureur || '',
    dateExpirationAssurance: vehicule.dateExpirationAssurance || '',
    dateProchainControleTechnique: vehicule.dateProchainControleTechnique || '',
  }
}

/** PTAC saisi : vide = aucune valeur (le Vue faisait `$event ? Number($event) : null`). */
const toPtac = (value: string) => (value ? Number(value) : null)

/** Corps de POST /vehicules (Vehicules.vue:906) : champs vides omis, sauf le commentaire. */
export function toCreatePayload(
  values: VehicleFormValues,
  pictureBase64: string,
): VehiculeCreateRequest {
  return {
    immat: values.immat,
    brand: values.brand,
    model: values.model,
    comment: values.comment,
    relaiImmat: values.relaiImmat || undefined,
    vin: values.vin || undefined,
    numeroCarteGrise: values.numeroCarteGrise || undefined,
    dateMiseEnCirculation: values.dateMiseEnCirculation || undefined,
    typeCarburant: values.typeCarburant || undefined,
    ptac: toPtac(values.ptac) ?? undefined,
    numeroContratAssurance: values.numeroContratAssurance || undefined,
    assureur: values.assureur || undefined,
    dateExpirationAssurance: values.dateExpirationAssurance || undefined,
    dateProchainControleTechnique: values.dateProchainControleTechnique || undefined,
    pictureBase64: pictureBase64 || undefined,
  }
}

/** État de la photo pendant l'édition. */
export type VehiclePictureEdit = {
  /** Nouvelle photo (data-URL) choisie pendant l'édition. */
  pictureBase64: string | null
  /** « Supprimer la photo » cliqué. */
  removePicture: boolean
}

/**
 * Corps de PUT /vehicules/{id} (VehiculeDetail.vue:650) : remplacement complet, champs vides à
 * `null`, commentaire tel quel. La suppression de photo envoie `pictureBase64: ''`, que l'API
 * traite comme « photo inchangée » : le bouton est sans effet côté serveur (MIGRATION.md 8.3).
 */
export function toUpdatePayload(
  values: VehicleFormValues,
  { pictureBase64, removePicture }: VehiclePictureEdit,
): VehiculeUpdateRequest {
  const payload: Record<string, unknown> = {
    immat: values.immat,
    relaiImmat: values.relaiImmat || null,
    brand: values.brand,
    model: values.model,
    comment: values.comment,
    vin: values.vin || null,
    numeroCarteGrise: values.numeroCarteGrise || null,
    dateMiseEnCirculation: values.dateMiseEnCirculation || null,
    typeCarburant: values.typeCarburant || null,
    ptac: toPtac(values.ptac),
    numeroContratAssurance: values.numeroContratAssurance || null,
    assureur: values.assureur || null,
    dateExpirationAssurance: values.dateExpirationAssurance || null,
    dateProchainControleTechnique: values.dateProchainControleTechnique || null,
  }
  if (pictureBase64) {
    payload.pictureBase64 = pictureBase64
  } else if (removePicture) {
    payload.pictureBase64 = ''
  }
  // Les `null` sont voulus (remplacement complet) mais absents du type du service copié tel quel
  return payload as VehiculeUpdateRequest
}
