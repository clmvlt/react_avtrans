import { useState } from 'react'
import { toLocalDateKey } from '@/lib/dates'
import { useMyCouchettesQuery } from '../api/useMyCouchettesQuery'
import { countCurrentMonth, formatDayLong, groupCouchettesByMonth } from '../lib/couchetteDates'

const PAGE_SIZE = 20

/**
 * Données de /mycouchettes : page de l'historique et valeurs dérivées.
 *
 * Reproduits du Vue (MIGRATION.md 8.2 et annexe) :
 * - B-10 : couchette du jour et compteur « Ce mois » cherchés dans la **page affichée** ; depuis
 *   la page 2, le héros propose de redéclarer (400 « existe déjà ») ;
 * - « aujourd'hui » figé au montage (faux si la page reste ouverte après minuit) ;
 * - « Réessayer » recharge la dernière page affichée, pas celle dont le chargement a échoué.
 */
export function useMyCouchettes() {
  const [page, setPage] = useState(0)
  const [lastShownPage, setLastShownPage] = useState(0)
  const [today] = useState(() => new Date())
  const query = useMyCouchettesQuery({ page, size: PAGE_SIZE })

  const data = query.data
  const couchettes = data?.content ?? []
  const currentPage = data?.page ?? 0
  const totalPages = data?.totalPages ?? 0
  const todayKey = toLocalDateKey(today)

  const changePage = (nextPage: number) => {
    setLastShownPage(currentPage)
    setPage(nextPage)
  }

  return {
    query,
    couchettes,
    groups: groupCouchettesByMonth(couchettes),
    currentPage,
    totalPages,
    totalElements: data?.totalElements ?? 0,
    todayKey,
    /** « jeudi 25 septembre » */
    todayLabel: formatDayLong(today),
    todayCouchette: couchettes.find((couchette) => couchette.date === todayKey),
    monthCount: countCurrentMonth(couchettes),
    goToPage: (nextPage: number) => {
      if (nextPage >= 0 && nextPage < totalPages) changePage(nextPage)
    },
    /** Après une déclaration : retour en page 1. */
    showFirstPage: () => changePage(0),
    retry: () => {
      if (page === lastShownPage) void query.refetch()
      else setPage(lastShownPage)
    },
  }
}
