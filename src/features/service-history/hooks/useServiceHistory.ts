import { use } from 'react'
import { ServiceHistoryContext } from '../service-history-context'

/**
 * Pilotage de la modale « Historique du pointage » : `open(uuid)`, `close()`, `isOpen`,
 * `serviceUuid`. Disponible dans toute l'app authentifiée (ServiceHistoryProvider d'AppLayout).
 * Pour recharger l'historique après une action sur un pointage : invalider
 * `serviceHistoryKeys.all` (équivalent du `reload()` du Vue).
 */
export function useServiceHistory() {
  const context = use(ServiceHistoryContext)
  if (!context) {
    throw new Error('useServiceHistory doit être utilisé dans un ServiceHistoryProvider')
  }
  return context
}
