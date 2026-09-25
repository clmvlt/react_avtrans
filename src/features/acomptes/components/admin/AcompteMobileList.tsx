import { Banknote } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { formatDateTime } from '@/features/absences/lib/dateFormat'
import type { AcompteDTO } from '@/models'
import { formatMontantAdmin } from '../../lib/formatMontantAdmin'
import { AcompteStatusBadge } from '../AcompteStatusBadge'
import { PaymentStatusBadge } from '../PaymentStatusBadge'
import { AcompteActionsDropdown } from './AcompteActionsDropdown'
import type { AcompteActionHandler } from './acompteRowActions'

type AcompteMobileListProps = {
  acomptes: AcompteDTO[]
  totalElements: number
  onAction: AcompteActionHandler
  isPaymentPending: (acompte: AcompteDTO) => boolean
}

/** Liste des acomptes en cartes (sous `md`), avec menu d'actions par carte. */
export function AcompteMobileList({
  acomptes,
  totalElements,
  onAction,
  isPaymentPending,
}: AcompteMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{totalElements} acompte(s)</p>

      {acomptes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Banknote className="size-10 opacity-50" />
          <p>Aucun acompte trouvé</p>
        </div>
      )}

      {acomptes.map((acompte) => (
        <div key={acompte.uuid} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={acompte.user} />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {acompte.user?.firstName} {acompte.user?.lastName}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatMontantAdmin(acompte.montant)}
                </span>
              </div>
            </div>
            <AcompteActionsDropdown
              acompte={acompte}
              onAction={onAction}
              paymentPending={isPaymentPending(acompte)}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AcompteStatusBadge status={acompte.status} />
            <PaymentStatusBadge isPaid={acompte.isPaid} />
          </div>

          <div className="mt-2 text-sm">
            {acompte.raison && (
              <p className="line-clamp-2 text-muted-foreground">{acompte.raison}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTime(acompte.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
