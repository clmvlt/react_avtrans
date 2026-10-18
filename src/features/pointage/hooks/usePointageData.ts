import { useInvalidateOnDayChange } from '@/hooks/useDayChange'
import type { Received } from '@/lib/liveCounter'
import type { ServiceDTO } from '@/models'
import type { WorkedHoursDTO } from '@/services'
import { pointageKeys } from '../api/queryKeys'
import { useActiveServiceQuery } from '../api/useActiveServiceQuery'
import { useDailyServicesQuery } from '../api/useDailyServicesQuery'
import { useMyWorkedHoursQuery } from '../api/useMyWorkedHoursQuery'
import { EMPTY_WORKDAY } from '../lib/dailyWorkday'

const NO_ACTIVE_SERVICE: Received<ServiceDTO | null> = { data: null, receivedAt: 0 }
const NO_HOURS: Received<WorkedHoursDTO> = { data: {}, receivedAt: 0 }

/**
 * Données de la carte d'état et des compteurs (`loadData` de Pointage.vue) : service en cours,
 * heures nettes, journée de travail en cours (la veille pour un service de nuit), chacun avec
 * l'instant de sa réception (compteurs en direct, D12). Les trois requêtes partent en parallèle et sont relancées au retour sur l'onglet, toutes
 * les 5 minutes et au changement de jour. Un échec de **chargement** remplace le contenu de la
 * page (avec « Réessayer »), un échec de rafraîchissement en arrière-plan garde les données.
 */
export function usePointageData() {
  const activeQuery = useActiveServiceQuery()
  const hoursQuery = useMyWorkedHoursQuery()
  const dailyQuery = useDailyServicesQuery()
  useInvalidateOnDayChange(pointageKeys.all)

  const queries = [activeQuery, hoursQuery, dailyQuery]
  const failedQueries = queries.filter((query) => query.isLoadingError)
  const loadError = failedQueries[0]?.error

  return {
    active: activeQuery.data ?? NO_ACTIVE_SERVICE,
    /** Journée de travail en cours (`DailyWorkday`) */
    today: dailyQuery.data ?? EMPTY_WORKDAY,
    hours: hoursQuery.data ?? NO_HOURS,
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
