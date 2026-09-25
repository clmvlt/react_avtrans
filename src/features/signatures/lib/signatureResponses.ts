import type { SignatureDTO, UserDTO, UserWithLastSignatureDTO } from '@/models'
import type { ApiResponse } from '@/types'

/**
 * Formes réelles des réponses admin (le service les type en `ApiResponse<…[]>`, ce qui est faux :
 * le Vue les relisait par un cast `unknown`). La clé attendue est lue d'abord, `data` en repli.
 */
type AllUsersSignaturesResponse = ApiResponse<UserWithLastSignatureDTO[]> & {
  users?: UserWithLastSignatureDTO[]
}
type UserSignaturesResponse = ApiResponse<SignatureDTO[]> & {
  signatures?: SignatureDTO[]
}

/** GET /signatures/all-users → `{ success, users: [{ user, lastSignature }] }`. */
export function toUsersWithLastSignature(
  response: AllUsersSignaturesResponse | null | undefined,
): UserWithLastSignatureDTO[] {
  return response?.users ?? response?.data ?? []
}

/** GET /signatures/user/{uuid} → `{ success, signatures }`. */
export function toUserSignatures(
  response: UserSignaturesResponse | null | undefined,
): SignatureDTO[] {
  return response?.signatures ?? response?.data ?? []
}

/** Entrée de la liste admin dont l'utilisateur est défini (les autres ne sont pas affichées). */
export type SignatureUserEntry = UserWithLastSignatureDTO & { user: UserDTO }

/**
 * Entrées affichées dans la table : utilisateur défini, puis recherche sur « Prénom Nom » ou
 * l'e-mail. Comme le Vue, la saisie n'est trimée que pour tester si elle est vide.
 */
export function filterSignatureEntries(
  entries: UserWithLastSignatureDTO[],
  search: string,
): SignatureUserEntry[] {
  const valid = entries.filter((entry): entry is SignatureUserEntry => !!entry.user)
  if (!search.trim()) return valid

  const query = search.toLowerCase()
  return valid.filter(({ user }) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
    const email = (user.email || '').toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })
}
