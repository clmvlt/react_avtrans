import type { CarteCreateRequest, CarteDTO, CarteUpdateRequest } from '@/models'
import type { CarteFormValues } from '../schemas/carteForm'

export const EMPTY_CARTE_FORM: CarteFormValues = {
  nom: '',
  description: '',
  code: '',
  numero: '',
  dateExpiration: '',
  userUuid: '',
  typeCarteUuid: '',
}

/** Valeurs du formulaire à partir de la carte chargée (GET /cartes/{uuid}). */
export function toCarteFormValues(carte: CarteDTO | null | undefined): CarteFormValues {
  if (!carte?.uuid) return EMPTY_CARTE_FORM
  return {
    nom: carte.nom || '',
    description: carte.description || '',
    code: carte.code || '',
    numero: carte.numero || '',
    dateExpiration: carte.dateExpiration || '',
    userUuid: carte.userUuid || carte.user?.uuid || '',
    typeCarteUuid: carte.typeCarteUuid || carte.typeCarte?.uuid || '',
  }
}

/** Requête de création : champs optionnels vides omis. */
export function toCarteCreateRequest(values: CarteFormValues): CarteCreateRequest {
  return {
    nom: values.nom.trim(),
    code: values.code.trim(),
    typeCarteUuid: values.typeCarteUuid,
    description: values.description.trim() || undefined,
    numero: values.numero.trim() || undefined,
    userUuid: values.userUuid || undefined,
    dateExpiration: values.dateExpiration || undefined,
  }
}

/**
 * Requête de modification. Un titulaire retiré est envoyé en `clearUser: true` ; en revanche la
 * description, le numéro ou l'expiration vidés sont omis, et l'API les laisse inchangés
 * (impossible de les effacer : MIGRATION.md 8.3, reproduit).
 */
export function toCarteUpdateRequest(values: CarteFormValues): CarteUpdateRequest {
  const request: CarteUpdateRequest = {
    nom: values.nom.trim(),
    code: values.code.trim(),
    typeCarteUuid: values.typeCarteUuid,
    description: values.description.trim() || undefined,
    numero: values.numero.trim() || undefined,
    dateExpiration: values.dateExpiration || undefined,
  }
  if (values.userUuid) request.userUuid = values.userUuid
  else request.clearUser = true
  return request
}
