import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import type { UserDTO } from '@/models'
import { isUserVisible } from '@/utils/userVisibility'
import { sortUsers, USER_SORT_ACCESSORS } from '../lib/sortUsers'

/**
 * Recherche, case « Afficher les masqués » et tri de la page Utilisateurs (état local, pas dans
 * l'URL : décision Q-URL). Les masqués sont affichés par défaut : GET /users est la seule liste où
 * ils apparaissent encore. Pas de `selectableUsers()` ici (administration des comptes).
 */
export function useUsersFilters(users: UserDTO[]) {
  const [search, setSearch] = useState('')
  const [showHidden, setShowHidden] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])

  const query = search.toLowerCase()
  const filtered = users.filter((user) => {
    if (!showHidden && !isUserVisible(user)) return false
    if (!search.trim()) return true
    const fullName = USER_SORT_ACCESSORS.fullName(user).toLowerCase()
    const email = (user.email || '').toLowerCase()
    return fullName.includes(query) || email.includes(query)
  })

  return {
    search,
    setSearch,
    showHidden,
    setShowHidden,
    sorting,
    setSorting,
    /** Nombre de comptes masqués (sur toute la liste) */
    hiddenCount: users.filter((user) => !isUserVisible(user)).length,
    /** Comptes filtrés puis triés */
    visibleUsers: sortUsers(filtered, sorting),
  }
}
