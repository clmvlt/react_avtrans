import { useState, type ReactNode } from 'react'
import { ServiceHistoryContext } from '../service-history-context'

type ServiceHistoryState = {
  isOpen: boolean
  serviceUuid: string | null
}

type ServiceHistoryProviderProps = {
  children: ReactNode
}

/**
 * État d'ouverture de la modale d'historique d'un pointage, monté par AppLayout : il disparaît
 * avec l'app authentifiée (déconnexion), comme le `reset()` du Vue.
 */
export function ServiceHistoryProvider({ children }: ServiceHistoryProviderProps) {
  const [state, setState] = useState<ServiceHistoryState>({ isOpen: false, serviceUuid: null })

  const value = {
    ...state,
    open: (serviceUuid: string | null | undefined) => {
      if (!serviceUuid) return
      setState({ isOpen: true, serviceUuid })
    },
    close: () => setState((current) => ({ ...current, isOpen: false })),
  }

  return <ServiceHistoryContext value={value}>{children}</ServiceHistoryContext>
}
