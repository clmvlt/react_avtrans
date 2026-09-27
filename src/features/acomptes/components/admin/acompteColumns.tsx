import type { ColumnDef } from '@tanstack/react-table'
import { Banknote, Check, Undo2, X } from 'lucide-react'
import { DataTableColumnHeader } from '@/components/shared/DataTableColumnHeader'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/features/absences/lib/dateFormat'
import { legacySortingFn } from '@/features/absences/lib/legacySortCompare'
import type { AcompteDTO } from '@/models'
import { formatMontantAdmin } from '../../lib/formatMontantAdmin'
import { AcompteStatusBadge } from '../AcompteStatusBadge'
import { PaymentStatusBadge } from '../PaymentStatusBadge'
import { AcompteActionsDropdown } from './AcompteActionsDropdown'
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
        // Action du moment visible (validation, puis paiement ; icône sous 2xl) ; le reste dans « ⋮ »
        <div className="flex items-center justify-end gap-1">
          {acompte.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="border-success/40 text-success hover:bg-success/10 hover:text-success max-2xl:size-8"
                title="Approuver"
                onClick={() => onAction('approve', acompte)}
              >
                <Check className="size-4" />
                <span className="max-2xl:sr-only">Approuver</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive max-2xl:size-8"
                title="Refuser"
                onClick={() => onAction('reject', acompte)}
              >
                <X className="size-4" />
                <span className="max-2xl:sr-only">Refuser</span>
              </Button>
            </>
          )}
          {acompte.status === 'APPROVED' && (
            <Button
              size="sm"
              variant="outline"
              className="max-2xl:size-8"
              title={acompte.isPaid ? 'Marquer comme non payé' : 'Marquer comme payé'}
              disabled={isPaymentPending(acompte)}
              onClick={() => onAction('togglePayment', acompte)}
            >
              {acompte.isPaid ? <Undo2 className="size-4" /> : <Banknote className="size-4" />}
              <span className="max-2xl:sr-only">
                {acompte.isPaid ? 'Marquer non payé' : 'Marquer payé'}
              </span>
            </Button>
          )}
          <AcompteActionsDropdown
            acompte={acompte}
            onAction={onAction}
            paymentPending={isPaymentPending(acompte)}
          />
        </div>
      ),
    },
  ]
}
