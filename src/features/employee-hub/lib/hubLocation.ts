/** Chemin de la fiche employé (page du menu, employé et onglet dans l'URL). */
export const EMPLOYEE_HUB_PATH = '/employes'

/** Paramètres d'URL de la fiche : employé choisi et onglet ouvert. */
export const HUB_EMPLOYEE_PARAM = 'employe'
export const HUB_TAB_PARAM = 'onglet'

/** Lien vers la fiche d'un employé, sur un onglet précis ou celui par défaut. */
export function employeeHubPath(userUuid: string | undefined, tab?: string): string {
  const params = new URLSearchParams()
  if (userUuid) params.set(HUB_EMPLOYEE_PARAM, userUuid)
  if (tab) params.set(HUB_TAB_PARAM, tab)
  const search = params.toString()
  return search ? `${EMPLOYEE_HUB_PATH}?${search}` : EMPLOYEE_HUB_PATH
}
