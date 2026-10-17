import { useNavigate, useSearchParams } from 'react-router'
import {
  EMPLOYEE_HUB_PATH,
  HUB_EMPLOYEE_PARAM,
  HUB_TAB_PARAM,
  employeeHubPath,
} from '../lib/hubLocation'
import { DEFAULT_HUB_TAB, type HubTab } from '../lib/hubTabs'

/**
 * Employé affiché et onglet ouvert, gardés dans l'URL (`?employe=…&onglet=…`) : rechargement,
 * retour arrière et lien partagé rouvrent la même fiche. Changer d'employé garde l'onglet.
 */
export function useHubSelection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const userUuid = searchParams.get(HUB_EMPLOYEE_PARAM) ?? ''
  const rawTab = searchParams.get(HUB_TAB_PARAM)

  return {
    userUuid,
    /** Onglet tel qu'écrit dans l'URL (à valider avec `parseHubTab`) */
    rawTab,
    selectUser: (uuid: string) => navigate(employeeHubPath(uuid, rawTab ?? undefined)),
    clearUser: () => navigate(EMPLOYEE_HUB_PATH),
    /** Changement d'onglet sans nouvelle entrée d'historique */
    setTab: (tab: HubTab) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (tab === DEFAULT_HUB_TAB) next.delete(HUB_TAB_PARAM)
          else next.set(HUB_TAB_PARAM, tab)
          return next
        },
        { replace: true },
      ),
  }
}
