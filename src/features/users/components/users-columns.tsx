import type { ColumnDef } from '@tanstack/react-table'
import { Pencil } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { Button } from '@/components/ui/button'
import type { UserDTO, UserLastVehicleDTO } from '@/models'
import type { UserActions } from '../hooks/useUserActions'
import { USER_SORT_ACCESSORS } from '../lib/sortUsers'
import { AccountStatusBadges } from './AccountStatusBadges'
import { LastVehicleInfo } from './LastVehicleInfo'
import { MailVerifiedBadge } from './MailVerifiedBadge'
import { PresenceBadge } from './PresenceBadge'
import { RoleBadge } from './RoleBadge'
import { UserActionsDropdown } from './UserActionsDropdown'
import { UserIdentityCell } from './UserIdentityCell'

type UserColumnsOptions = {
  /** Nombre de comptes affichés, repris dans l'en-tête « Utilisateurs (N) » */
  count: number
  lastVehicles: Map<string, UserLastVehicleDTO> | undefined
  actions: UserActions
}

/**
 * Colonnes du tableau des comptes (Users.vue). Le tri est fait en amont (`sortUsers`, partagé avec
 * les cartes mobiles) : les `accessorFn` servent seulement à rendre les en-têtes triables.
 */
export function getUserColumns({
  count,
  lastVehicles,
  actions,
}: UserColumnsOptions): ColumnDef<UserDTO>[] {
  return [
    {
      id: 'fullName',
      accessorFn: USER_SORT_ACCESSORS.fullName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`Utilisateurs (${count})`} />
      ),
      cell: ({ row }) => <UserIdentityCell user={row.original} />,
    },
    {
      id: 'isMailVerifiedSort',
      accessorFn: USER_SORT_ACCESSORS.isMailVerifiedSort,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MailVerifiedBadge verified={row.original.isMailVerified} />
          <Button
            variant="ghost"
            size="icon-sm"
            title="Modifier l'email"
            onClick={() => actions.openEmail(row.original)}
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      ),
    },
    {
      id: 'roleName',
      accessorFn: USER_SORT_ACCESSORS.roleName,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Rôle" />,
      cell: ({ row }) => <RoleBadge role={row.original.role} showEmpty />,
    },
    {
      id: 'statusSort',
      accessorFn: USER_SORT_ACCESSORS.statusSort,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Présence" />,
      cell: ({ row }) => <PresenceBadge status={row.original.status} />,
    },
    {
      id: 'isActiveSort',
      accessorFn: USER_SORT_ACCESSORS.isActiveSort,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Compte" />,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <AccountStatusBadges user={row.original} />
        </div>
      ),
    },
    {
      id: 'lastVehicle',
      enableSorting: false,
      header: 'Dernier véhicule',
      cell: ({ row }) => (
        <LastVehicleInfo
          vehicle={row.original.uuid ? lastVehicles?.get(row.original.uuid) : undefined}
        />
      ),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: 'Actions',
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row }) => (
        // Action courante visible, les autres dans le menu « ⋮ » (mêmes entrées que sur mobile)
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" onClick={() => actions.openEdit(row.original)}>
            <Pencil className="size-4" />
            Modifier
          </Button>
          <UserActionsDropdown user={row.original} actions={actions} />
        </div>
      ),
    },
  ]
}
