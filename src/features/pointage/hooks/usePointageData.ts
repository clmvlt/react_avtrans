import { useActiveServiceQuery } from '../api/useActiveServiceQuery'
import { useDailyServicesQuery } from '../api/useDailyServicesQuery'
import { useMyWorkedHoursQuery } from '../api/useMyWorkedHoursQuery'

const EMPTY_HOURS = { day: 0, week: 0, month: 0, year: 0, lastMonth: 0 }

/**
 * Données de la carte d'état et des compteurs (`loadData` de Pointage.vue) : service en cours,
 * heures travaillées, services du jour. Les trois requêtes partent en parallèle ; un échec de
 * **chargement** remplace le contenu de la page (avec « Réessayer »), un échec de
 * rafraîchissement en arrière-plan garde les données affichées.
 */
export function usePointageData() {
  const activeQuery = useActiveServiceQuery()
  const hoursQuery = useMyWorkedHoursQuery()
  const dailyQuery = useDailyServicesQuery()

  const queries = [activeQuery, hoursQuery, dailyQuery]
  const failedQueries = queries.filter((query) => query.isLoadingError)
  const loadError = failedQueries[0]?.error

  return {
    activeService: activeQuery.data ?? null,
    todayServices: dailyQuery.data ?? [],
    workedHours: hoursQuery.data ?? EMPTY_HOURS,
    isLoading: queries.some((query) => query.isPending),
    loadErrorMessage:
      failedQueries.length > 0
        ? loadError instanceof Error
          ? loadError.message
          : 'Erreur lors du chargement des données'
        : null,
    isRetrying: failedQueries.some((query) => query.isFetching),
    retry: () => failedQueries.forEach((query) => void query.refetch()),
  }
}
