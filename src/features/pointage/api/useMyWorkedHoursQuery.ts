import { useQuery } from '@tanstack/react-query'
import { userServicesService, type WorkedHoursDTO } from '@/services'
import { pointageKeys } from './queryKeys'

/** Heures décimales normalisées (0 si absentes), comme `loadData` de Pointage.vue. */
const toWorkedHours = (response: WorkedHoursDTO | null) => ({
  day: response?.day || 0,
  week: response?.week || 0,
  month: response?.month || 0,
  year: response?.year || 0,
  lastMonth: response?.lastMonth || 0,
})

/** Heures travaillées de l'utilisateur connecté, toutes périodes (GET /services/hours). */
export function useMyWorkedHoursQuery() {
  return useQuery({
    queryKey: pointageKeys.hours(),
    queryFn: () => userServicesService.getWorkedHours(),
    select: toWorkedHours,
  })
}
