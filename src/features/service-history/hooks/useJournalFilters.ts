import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ServiceModificationSearchRequest } from '@/models'
import { serviceModificationsSearchKey } from '../api/useServiceModificationsSearchQuery'
import {
  buildJournalRequest,
  EMPTY_JOURNAL_FILTERS,
  type JournalFilterValues,
} from '../lib/journalFilters'

const sameRequest = (a: ServiceModificationSearchRequest, b: ServiceModificationSearchRequest) =>
  JSON.stringify(a) === JSON.stringify(b)

/**
 * Filtres du journal des pointages : valeurs saisies (`draft`) et requête appliquée (`request`).
 * Comme `loadModifications` du Vue, toute recherche (« Rechercher », changement de page,
 * « Réessayer ») part des filtres **saisis** ; une plage de dates inversée est refusée par un
 * toast. Filtres locaux, pas dans l'URL (Q-URL).
 */
export function useJournalFilters() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<JournalFilterValues>(EMPTY_JOURNAL_FILTERS)
  const [request, setRequest] = useState<ServiceModificationSearchRequest>(() =>
    buildJournalRequest(EMPTY_JOURNAL_FILTERS, 0),
  )

  const search = (page = 0, filters: JournalFilterValues = draft) => {
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      toast.error('Filtres', {
        description: 'La date de début doit précéder la date de fin',
        duration: 7000,
      })
      return
    }

    const next = buildJournalRequest(filters, page)
    setRequest(next)
    // Même requête : le Vue la relançait
    if (sameRequest(next, request)) {
      void queryClient.refetchQueries({
        queryKey: serviceModificationsSearchKey(next),
        exact: true,
      })
    }
  }

  const reset = () => {
    setDraft(EMPTY_JOURNAL_FILTERS)
    search(0, EMPTY_JOURNAL_FILTERS)
  }

  return { draft, setDraft, request, search, reset }
}
