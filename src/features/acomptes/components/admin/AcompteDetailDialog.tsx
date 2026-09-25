import { UserIdentity } from '@/components/shared/UserIdentity'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DetailItem } from '@/features/absences/components/DetailItem'
import { formatDateTime } from '@/features/absences/lib/dateFormat'
import type { AcompteDTO } from '@/models'
import { formatMontantAdmin } from '../../lib/formatMontantAdmin'
import { AcompteStatusBadge } from '../AcompteStatusBadge'
import { PaymentStatusBadge } from '../PaymentStatusBadge'

type AcompteDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  acompte: AcompteDTO | null
  onApprove: (acompte: AcompteDTO) => void
  onReject: (acompte: AcompteDTO) => void
}

/** Détail d'un acompte côté admin (port d'`AcompteDetailModal.vue`). */
export function AcompteDetailDialog({
  open,
  onOpenChange,
  acompte,
  onApprove,
  onReject,
}: AcompteDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de l&apos;acompte</DialogTitle>
          <DialogDescription className="sr-only">
            Informations détaillées de l&apos;acompte
          </DialogDescription>
        </DialogHeader>

        {acompte && (
          <div className="space-y-5">
            <div className="border-b pb-4">
              <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">
                Employé
              </h4>
              <UserIdentity user={acompte.user} size="xl" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Montant">
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatMontantAdmin(acompte.montant)}
                </span>
              </DetailItem>
              <DetailItem label="Statut">
                <AcompteStatusBadge status={acompte.status} />
              </DetailItem>
              <DetailItem label="Paiement">
                <PaymentStatusBadge isPaid={acompte.isPaid} />
              </DetailItem>
              {acompte.isPaid && acompte.paidDate && (
                <DetailItem label="Date de paiement">
                  <span className="font-medium text-foreground">
                    {formatDateTime(acompte.paidDate)}
                  </span>
                </DetailItem>
              )}
            </div>

            <DetailItem label="Raison">
              <span className="font-medium text-foreground">{acompte.raison || '-'}</span>
            </DetailItem>

            {acompte.validatedBy && (
              <div className="border-b pb-4">
                <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">
                  Validation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Validé par">
                    <span className="font-medium text-foreground">
                      {acompte.validatedBy.firstName} {acompte.validatedBy.lastName}
                    </span>
                  </DetailItem>
                  <DetailItem label="Date de validation">
                    <span className="font-medium text-foreground">
                      {formatDateTime(acompte.validatedAt)}
                    </span>
                  </DetailItem>
                </div>
                {acompte.rejectionReason && (
                  <DetailItem label="Motif du refus" className="mt-4">
                    <span className="font-medium text-destructive italic">
                      {acompte.rejectionReason}
                    </span>
                  </DetailItem>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Créé le">
                <span className="font-medium text-foreground">
                  {formatDateTime(acompte.createdAt)}
                </span>
              </DetailItem>
              <DetailItem label="Modifié le">
                <span className="font-medium text-foreground">
                  {formatDateTime(acompte.updatedAt)}
                </span>
              </DetailItem>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {acompte?.status === 'PENDING' && (
            <>
              <Button type="button" onClick={() => onApprove(acompte)}>
                Approuver
              </Button>
              <Button type="button" variant="destructive" onClick={() => onReject(acompte)}>
                Refuser
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
