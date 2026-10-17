import { useAdminAbsencesQuery } from '@/features/absences/api/useAdminAbsencesQuery'
import { useAdminAcomptesQuery } from '@/features/acomptes/api/useAdminAcomptesQuery'
import { pendingAbsenceParams, pendingAcompteParams } from '../lib/requestParams'

/**
 * Absences et acomptes en attente d'un employé : bloc « À traiter » de l'aperçu et pastilles des
 * onglets (même requête, partagée par le cache). Rechargées après chaque validation.
 */
export function usePendingRequests(userUuid: string) {
  const absencesQuery = useAdminAbsencesQuery(pendingAbsenceParams(userUuid))
  const acomptesQuery = useAdminAcomptesQuery(pendingAcompteParams(userUuid))

  return {
    absencesQuery,
    acomptesQuery,
    absences: absencesQuery.data?.absences ?? [],
    acomptes: acomptesQuery.data?.acomptes ?? [],
    absenceCount: absencesQuery.data?.totalElements ?? 0,
    acompteCount: acomptesQuery.data?.totalElements ?? 0,
  }
}
