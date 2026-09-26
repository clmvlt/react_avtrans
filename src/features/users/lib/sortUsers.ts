import type { SortingState } from '@tanstack/react-table'
import type { UserDTO } from '@/models'
import { compareLikeVue } from './compareLikeVue'

/** Valeurs de tri « à plat » de Users.vue, par identifiant de colonne. */
export const USER_SORT_ACCESSORS = {
  fullName: (user: UserDTO) => `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  isMailVerifiedSort: (user: UserDTO) => (user.isMailVerified ? 1 : 0),
  roleName: (user: UserDTO) => user.role?.nom || '',
  statusSort: (user: UserDTO) => user.status || '',
  isActiveSort: (user: UserDTO) => (user.isActive ? 1 : 0),
} satisfies Record<string, (user: UserDTO) => string | number>

type UserSortKey = keyof typeof USER_SORT_ACCESSORS

const isSortKey = (id: string): id is UserSortKey => id in USER_SORT_ACCESSORS

/**
 * Tri de la liste (tableau et cartes mobiles partagent le même ordre, comme `sortedData` du Vue).
 * Sans tri choisi : l'ordre de l'API.
 */
export function sortUsers(users: UserDTO[], sorting: SortingState): UserDTO[] {
  const sort = sorting[0]
  if (!sort || !isSortKey(sort.id)) return users
  const accessor = USER_SORT_ACCESSORS[sort.id]
  return [...users].sort((a, b) => {
    const comparison = compareLikeVue(accessor(a), accessor(b))
    return sort.desc ? -comparison : comparison
  })
}
