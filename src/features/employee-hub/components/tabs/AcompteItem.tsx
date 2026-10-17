import { Check, LoaderCircle, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateLong } from '@/features/absences/lib/dateFormat'
import { AcompteStatusBadge } from '@/features/acomptes/components/AcompteStatusBadge'
import { PaymentStatusBadge } from '@/features/acomptes/components/PaymentStatusBadge'
import { AcompteActionsDropdown } from '@/features/acomptes/components/admin/AcompteActionsDropdown'
import type { AcompteActionHandler } from '@/features/acomptes/components/admin/acompteRowActions'
import { formatMontantAdmin } from '@/features/acomptes/lib/formatMontantAdmin'
import type { AcompteDTO } from '@/models'

type AcompteItemProps = {
  acompte: AcompteDTO
  onAction: AcompteActionHandler
  /** Bascule de paiement de cet acompte en cours */
  paymentPending: boolean
}

/**
 * Un acompte de l'employé : montant, motif, date de demande, statut et paiement. Action du moment
 * visible (Approuver / Refuser en attente, « Marquer payé » une fois approuvé), le reste dans « ⋮ ».
 */
export function AcompteItem({ acompte, onAction, paymentPending }: AcompteItemProps) {
  const pending = acompte.status === 'PENDING'
  const approved = acompte.status === 'APPROVED'

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
      <button
        type="button"
        onClick={() => onAction('details', acompte)}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="min-w-24 font-mono text-xl font-bold text-foreground tabular-nums">
          {formatMontantAdmin(acompte.montant)}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <AcompteStatusBadge status={acompte.status} />
            {approved && <PaymentStatusBadge isPaid={acompte.isPaid} />}
          </span>
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            Demandé le {formatDateLong(acompte.createdAt)}
            {acompte.raison && ` · ${acompte.raison}`}
          </span>
        </span>
      </button>

      <div className="flex items-center justify-end gap-1">
        {pending && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onAction('reject', acompte)}
            >
              <X className="size-4" />
              Refuser
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-success"
              onClick={() => onAction('approve', acompte)}
            >
              <Check className="size-4" />
              Approuver
            </Button>
          </>
        )}
        {approved && !acompte.isPaid && (
          <Button
            variant="outline"
            size="sm"
            disabled={paymentPending}
            onClick={() => onAction('togglePayment', acompte)}
          >
            {paymentPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Wallet className="size-4" />
            )}
            Marquer payé
          </Button>
        )}
        <AcompteActionsDropdown
          acompte={acompte}
          onAction={onAction}
          paymentPending={paymentPending}
        />
      </div>
    </li>
  )
}
