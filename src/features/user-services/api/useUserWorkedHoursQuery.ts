import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { liveQueryOptions, receive, type Received } from '@/lib/liveCounter'
import { userServicesService, type HoursQueryParams, type WorkedHoursDTO } from '@/services'
import type { ApiResponse } from '@/types'
import { adminServicesKeys } from './queryKeys'

/** La réponse est enveloppée (`data`) ou nue selon les versions de l'API, comme le prévoyait le Vue. */
function toWorkedHours({
  data,
  receivedAt,
}: Received<ApiResponse<WorkedHoursDTO> | WorkedHoursDTO>): Received<WorkedHoursDTO> {
  const envelope = data as ApiResponse<WorkedHoursDTO>
  return { data: (envelope.data ? envelope.data : data) as WorkedHoursDTO, receivedAt }
}

type UseUserWorkedHoursQueryOptions = {
  /** Garde les chiffres de la période précédente pendant le chargement (dialog des heures). */
  keepPrevious?: boolean
}

/**
 * Heures nettes d'un employé (jour, semaine, mois, année, mois dernier ; ou une seule période
 * selon `params`), chacune en `HeuresPeriodeDTO` qui avance en direct si `enCours`. Partagé par le
 * dialog « Heures travaillées » et les cartes de stats des pointages d'un employé (même clé pour
 * `params = {}`).
 */
export function useUserWorkedHoursQuery(
  userUuid: string | undefined,
  params: HoursQueryParams,
  { keepPrevious = false }: UseUserWorkedHoursQueryOptions = {},
) {
  return useQuery({
    queryKey: adminServicesKeys.hours(userUuid ?? '', params),
    queryFn: () => receive(userServicesService.getUserWorkedHours(userUuid ?? '', params)),
    select: toWorkedHours,
    enabled: !!userUuid,
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    ...liveQueryOptions,
  })
}
