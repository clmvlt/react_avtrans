import type { UpdateUserRequest, UserDTO } from '@/models'
import { isUserVisible } from '@/utils/userVisibility'
import type { UserEditFormValues } from '../schemas/userEdit'

/** Valeurs initiales du formulaire à partir du compte (populateForm du Vue). */
export function toUserEditFormValues(user: UserDTO): UserEditFormValues {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    roleUuid: user.role?.uuid || '',
    isActive: user.isActive ?? true,
    isCouchette: user.isCouchette ?? false,
    isVisible: isUserVisible(user),
    heureContrat: user.heureContrat != null ? String(user.heureContrat) : '',
    telPersonnel: user.telPersonnel || '',
    telPro: user.telPro || '',
    driverLicenseNumber: user.driverLicenseNumber || '',
    street: user.address?.street || '',
    city: user.address?.city || '',
    postalCode: user.address?.postalCode || '',
    country: user.address?.country || 'France',
  }
}

/**
 * Corps du PUT /users/{uuid}, construit exactement comme UserEditModal.vue :
 * - adresse et permis toujours envoyés, même vides ;
 * - téléphones en chaîne (vide si effacé) : le backend ignore `null` ;
 * - heures de contrat : `null` si vide **ou 0** (le v-model du Vue convertissait le champ en nombre,
 *   et 0 était pris pour une absence de valeur) ;
 * - rôle envoyé seulement s'il est renseigné (vider le rôle ne change rien) ;
 * - `isVisible` envoyé seulement s'il a changé (l'API ignore les champs absents).
 */
export function toUpdateUserRequest(values: UserEditFormValues, user: UserDTO): UpdateUserRequest {
  const heureContrat = Number.parseFloat(values.heureContrat)
  const data: UpdateUserRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
    isActive: values.isActive,
    isCouchette: values.isCouchette,
    address: {
      street: values.street,
      city: values.city,
      postalCode: values.postalCode,
      country: values.country,
    },
    driverLicenseNumber: values.driverLicenseNumber,
    telPersonnel: values.telPersonnel.trim(),
    telPro: values.telPro.trim(),
    heureContrat: heureContrat ? heureContrat : null,
  }
  if (values.roleUuid) data.roleUuid = values.roleUuid
  if (values.isVisible !== isUserVisible(user)) data.isVisible = values.isVisible
  return data
}
