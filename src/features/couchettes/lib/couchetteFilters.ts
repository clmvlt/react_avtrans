import type { FilterConfig, FilterValues } from '@/components/shared/SearchFilters'
import type { UserDTO } from '@/models'
import { selectableUsers } from '@/utils/userVisibility'
import { formatFilterDate } from './couchetteDates'

const asText = (value: unknown) => (typeof value === 'string' ? value : '')

/**
 * Filtres de /couchettes : employé (visibles, plus l'employé déjà sélectionné même masqué pour
 * garder son libellé), date de début, date de fin.
 */
export function buildCouchetteFilterConfig(
  users: UserDTO[],
  selectedUserUuid: string,
): FilterConfig[] {
  return [
    {
      key: 'userUuid',
      label: 'Employé',
      type: 'select',
      placeholder: 'Tous les employés',
      options: selectableUsers(users, [selectedUserUuid])
        .filter((user) => user.uuid && user.firstName)
        .map((user) => ({
          value: user.uuid ?? '',
          label: `${user.firstName} ${user.lastName}`,
        })),
    },
    { key: 'startDate', label: 'Date de début', type: 'date' },
    { key: 'endDate', label: 'Date de fin', type: 'date' },
  ]
}

/**
 * Texte des filtres (« Prénom Nom · du 1 sept. au 3 sept. »), ou « 30 derniers jours affichés ».
 * Comme le Vue, il décrit la **saisie en cours**, pas la dernière recherche envoyée (bug de
 * l'annexe conservé), et cherche l'employé parmi tous les comptes.
 */
export function describeCouchetteFilters(values: FilterValues, users: UserDTO[]): string {
  const parts: string[] = []

  const userUuid = asText(values.userUuid)
  if (userUuid) {
    const user = users.find((u) => u.uuid === userUuid)
    if (user) parts.push(`${user.firstName} ${user.lastName}`)
  }

  const startDate = asText(values.startDate)
  const endDate = asText(values.endDate)
  if (startDate && endDate) {
    parts.push(`du ${formatFilterDate(startDate)} au ${formatFilterDate(endDate)}`)
  } else if (startDate) {
    parts.push(`à partir du ${formatFilterDate(startDate)}`)
  } else if (endDate) {
    parts.push(`jusqu'au ${formatFilterDate(endDate)}`)
  }

  return parts.length > 0 ? parts.join(' · ') : '30 derniers jours affichés'
}
