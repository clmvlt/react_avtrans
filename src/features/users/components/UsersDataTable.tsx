import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { Users2 } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import type { UserDTO, UserLastVehicleDTO } from '@/models'
import { isUserVisible } from '@/utils/userVisibility'
import type { UserActions } from '../hooks/useUserActions'
import { getUserColumns } from './users-columns'
import { UserRowContextMenu } from './UserRowContextMenu'

type UsersDataTableProps = {
  /** Comptes déjà filtrés et triés */
  users: UserDTO[]
  lastVehicles: Map<string, UserLastVehicleDTO> | undefined
  actions: UserActions
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
}

/** Tableau des comptes (à partir de `md`) : tri par en-tête, clic droit sur une ligne. */
export function UsersDataTable({
  users,
  lastVehicles,
  actions,
  sorting,
  onSortingChange,
}: UsersDataTableProps) {
  const columns = getUserColumns({ count: users.length, lastVehicles, actions })

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowId={(user, index) => user.uuid ?? String(index)}
      sorting={sorting}
      onSortingChange={onSortingChange}
      manualSorting
      emptyIcon={Users2}
      emptyMessage="Aucun utilisateur trouvé"
      getRowClassName={(user) => (!isUserVisible(user) ? 'bg-muted/40' : undefined)}
      renderRow={(row, tr) => (
        <UserRowContextMenu user={row.original} actions={actions}>
          {tr}
        </UserRowContextMenu>
      )}
      className="hidden md:block"
    />
  )
}
