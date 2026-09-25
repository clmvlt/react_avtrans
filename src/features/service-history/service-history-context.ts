import { createContext } from 'react'

/**
 * Modale globale « Historique du pointage » (admins) : ouverte depuis les notifications, le
 * journal des pointages et les pointages d'un employé. Remplace le singleton de module
 * useServiceHistory du Vue ; les données viennent de useServiceModificationsQuery.
 */
export type ServiceHistoryContextValue = {
  isOpen: boolean
  /** Pointage affiché (il a pu être supprimé : seul son historique est chargé) */
  serviceUuid: string | null
  /** Ouvre la modale sur ce pointage (sans UUID : rien ne se passe, comme le Vue) */
  open: (serviceUuid: string | null | undefined) => void
  close: () => void
}

export const ServiceHistoryContext = createContext<ServiceHistoryContextValue | null>(null)
