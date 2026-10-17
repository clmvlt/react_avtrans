import type { UserDTO, UserWithStatusDTO } from '@/models'
import { selectableUsers } from '@/utils/userVisibility'

/** Présence d'un employé, d'après GET /users/status (absent s'il n'y figure pas). */
export type Presence = 'PRESENT' | 'ON_BREAK' | 'ABSENT'

export type DirectoryEntry = {
  user: UserDTO
  presence: Presence
  /** Ligne de GET /users/status (service en cours, heures du jour), si l'employé y figure */
  status: UserWithStatusDTO | null
  fullName: string
}

export type DirectoryGroup = {
  presence: Presence
  label: string
  entries: DirectoryEntry[]
}

const GROUPS: { presence: Presence; label: string }[] = [
  { presence: 'PRESENT', label: 'En service' },
  { presence: 'ON_BREAK', label: 'En pause' },
  { presence: 'ABSENT', label: 'Pas en service' },
]

const toPresence = (status: UserWithStatusDTO | undefined): Presence =>
  status?.status === 'PRESENT' || status?.status === 'ON_BREAK' ? status.status : 'ABSENT'

/** Minuscules sans accents : « Héloïse » se trouve en tapant « helo ». */
export const normalizeSearch = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * Employés proposés par la fiche : comptes actifs et visibles (GET /users), avec leur présence
 * (GET /users/status), triés par nom puis prénom. `keepUuid` (employé affiché) reste dans la liste
 * même s'il est masqué ou inactif, comme les autres sélecteurs (`selectableUsers`).
 */
export function buildDirectory(
  users: UserDTO[],
  statuses: UserWithStatusDTO[],
  keepUuid = '',
): DirectoryEntry[] {
  const statusByUuid = new Map(statuses.map((status) => [status.uuid, status]))
  return selectableUsers(users, [keepUuid])
    .filter((user) => !!user.uuid && (user.isActive !== false || user.uuid === keepUuid))
    .map((user) => {
      const status = statusByUuid.get(user.uuid)
      return {
        user,
        presence: toPresence(status),
        status: status ?? null,
        fullName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '',
      }
    })
    .sort(
      (a, b) =>
        (a.user.lastName ?? '').localeCompare(b.user.lastName ?? '', 'fr', {
          sensitivity: 'base',
        }) ||
        (a.user.firstName ?? '').localeCompare(b.user.firstName ?? '', 'fr', {
          sensitivity: 'base',
        }),
    )
}

/** Groupes non vides, dans l'ordre : en service, en pause, pas en service. */
export function groupDirectory(entries: DirectoryEntry[]): DirectoryGroup[] {
  return GROUPS.map((group) => ({
    ...group,
    entries: entries.filter((entry) => entry.presence === group.presence),
  })).filter((group) => group.entries.length > 0)
}
