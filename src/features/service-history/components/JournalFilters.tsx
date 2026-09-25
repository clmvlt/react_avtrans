import { SearchFilters, type FilterConfig } from '@/components/shared/SearchFilters'
import { USER_ROLE_UUIDS } from '@/enums'
import type { UserDTO } from '@/models'
import { serviceModificationActionOptions } from '@/utils/serviceModificationFormatters'
import { selectableUsers } from '@/utils/userVisibility'
import {
  getActiveFiltersText,
  toJournalFilterValues,
  toUserOptions,
  type JournalFilterValues,
} from '../lib/journalFilters'

type JournalFiltersProps = {
  value: JournalFilterValues
  onChange: (value: JournalFilterValues) => void
  /** GET /users (masqués compris). */
  users: UserDTO[]
  loading: boolean
  onSearch: () => void
  onReset: () => void
}

/** Panneau de filtres du journal : employé, administrateur, type d'action, période. */
export function JournalFilters({
  value,
  onChange,
  users,
  loading,
  onSearch,
  onReset,
}: JournalFiltersProps) {
  const filters: FilterConfig[] = [
    {
      key: 'userUuid',
      label: 'Employé',
      type: 'select',
      placeholder: 'Tous les employés',
      // Visibles uniquement (+ l'employé déjà sélectionné, même masqué, pour garder le libellé)
      options: toUserOptions(selectableUsers(users, [value.userUuid])),
    },
    {
      key: 'modifiedByUuid',
      label: 'Administrateur',
      type: 'select',
      placeholder: 'Tous les admins',
      // Tous les administrateurs, même masqués des listes : ils ont pu agir sur des pointages
      options: toUserOptions(
        users.filter((user) => user.role?.uuid === USER_ROLE_UUIDS.ADMINISTRATEUR),
      ),
    },
    {
      key: 'action',
      label: "Type d'action",
      type: 'select',
      placeholder: 'Toutes les actions',
      options: serviceModificationActionOptions,
    },
    { key: 'startDate', label: 'Du', type: 'date' },
    { key: 'endDate', label: 'Au', type: 'date' },
  ]

  return (
    <SearchFilters
      value={value}
      onChange={(values) => onChange(toJournalFilterValues(values))}
      filters={filters}
      loading={loading}
      columns={5}
      hint={getActiveFiltersText(value, users)}
      onSearch={onSearch}
      onReset={onReset}
    />
  )
}
