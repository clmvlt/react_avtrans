import { useUsersWithStatusQuery } from '@/features/monitoring/api/useUsersWithStatusQuery'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { buildDirectory } from '../lib/employeeDirectory'

/**
 * Employés de la fiche (GET /users) avec leur présence (GET /users/status, rafraîchie toutes les
 * 10 s comme le suivi des présences). Une erreur des présences n'empêche pas la liste : tout le
 * monde apparaît alors « pas en service ».
 */
export function useEmployeeDirectory(keepUuid: string) {
  const usersQuery = useUsersQuery()
  const statusQuery = useUsersWithStatusQuery()

  return {
    usersQuery,
    entries: buildDirectory(usersQuery.data ?? [], statusQuery.data?.users ?? [], keepUuid),
    /** Réception des présences : base des heures du jour en direct */
    receivedAt: statusQuery.data?.receivedAt ?? 0,
  }
}
