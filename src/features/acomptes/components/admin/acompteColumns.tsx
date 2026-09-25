import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/features/absences/lib/dateFormat'
import { legacySortingFn } from '@/features/absences/lib/legacySortCompare'
import type { AcompteDTO } from '@/models'
import { formatMontantAdmin } from '../../lib/formatMontantAdmin'
import { AcompteStatusBadge } from '../AcompteStatusBadge'
import { PaymentStatusBadge } from '../PaymentStatusBadge'
import type { AcompteActionHandler } from './acompteRowActions'

/**
 * Colonnes de la table admin des acomptes (desktop). Tri client sur la page affichée avec le
 * comparateur du Vue (B-19 reproduit, y compris `Date.parse` appliqué aux montants et raisons).
 */
export function getAcompteColumns(
  totalElements: number,
  onAction: AcompteActionHandler,
  isPaymentPending: (acompte: AcompteDTO) => boolean,
): ColumnDef<AcompteDTO>[] {
  return [
    {
      id: 'userName',
      accessorFn: (acompte) =>
        `${acompte.user?.firstName || ''} ${acompte.user?.lastName || ''}`.trim(),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={`Acomptes (${totalElements})`} />
      ),
      sortingFn: legacySortingFn,
      cell: ({ row: { original: acompte } }) => (
        <div className="flex items-center gap-3">
          <UserAvatar user={acompte.user} />
          <span className="font-medium text-foreground">
            {acompte.user?.firstName} {acompte.user?.lastName}
          </span>
        </div>
      ),
    },
    {
      id: 'montant',
      accessorFn: (acompte) => acompte.montant,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Montant" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: acompte } }) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatMontantAdmin(acompte.montant)}
        </span>
      ),
    },
    {
      id: 'raison',
      accessorFn: (acompte) => acompte.raison,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Raison" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: acompte } }) => (
        <span className="text-sm text-muted-foreground">{acompte.raison || '-'}</span>
      ),
    },
    {
      id: 'status',
      accessorFn: (acompte) => acompte.status,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: acompte } }) => (
        <div className="flex flex-col items-start gap-1">
          <AcompteStatusBadge status={acompte.status} />
          {acompte.validatedBy && acompte.status !== 'PENDING' && (
            <span className="text-xs text-muted-foreground">
              par {acompte.validatedBy.firstName} {acompte.validatedBy.lastName}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'payment',
      accessorFn: (acompte) => (acompte.isPaid ? 1 : 0),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Paiement" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: acompte } }) => (
        <div className="flex flex-col items-start gap-1">
          <PaymentStatusBadge isPaid={acompte.isPaid} />
          {acompte.isPaid && acompte.paidDate && (
            <span className="text-xs text-muted-foreground italic">
              {formatDateTime(acompte.paidDate)}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'createdAt',
      accessorFn: (acompte) => acompte.createdAt,
      header: ({ column }) => <DataTableColumnHeader column={column} title="Demandé le" />,
      sortingFn: legacySortingFn,
      cell: ({ row: { original: acompte } }) => (
        <span className="text-sm text-muted-foreground">{formatDateTime(acompte.createdAt)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row: { original: acompte } }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          {acompte.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-green-500/50 text-green-600 hover:bg-green-500/10"
                title="Approuver"
                onClick={() => onAction('approve', acompte)}
              >
                Approuver
              </Button>
              <Button
                size="sm"
                variant="destructive"
                title="Refuser"
                onClick={() => onAction('reject', acompte)}
              >
                Refuser
              </Button>
            </>
          )}
          {acompte.status === 'APPROVED' && (
            <Button
              size="sm"
              variant={acompte.isPaid ? 'outline' : 'default'}
              title={acompte.isPaid ? 'Marquer comme non payé' : 'Marquer comme payé'}
              disabled={isPaymentPending(acompte)}
              onClick={() => onAction('togglePayment', acompte)}
            >
              {acompte.isPaid ? 'Non payé' : 'Payé'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            title="Détails"
            onClick={() => onAction('details', acompte)}
          >
            Détails
          </Button>
          <Button
            size="sm"
            variant="destructive"
            title="Supprimer"
            onClick={() => onAction('delete', acompte)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ]
}
