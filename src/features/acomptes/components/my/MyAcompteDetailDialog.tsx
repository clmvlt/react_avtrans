import { Clock } from 'lucide-react'
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
import { formatMontant } from '@/utils/acompteFormatters'
import { AcompteStatusBadge } from '../AcompteStatusBadge'
import { PaymentStatusBadge } from '../PaymentStatusBadge'

type MyAcompteDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  acompte: AcompteDTO | null
  onCancelRequest: (acompte: AcompteDTO) => void
}

const LABEL = 'font-medium tracking-wide'

/** Détail d'une de mes demandes d'acompte (port de `MyAcompteDetailModal.vue`). */
export function MyAcompteDetailDialog({
  open,
  onOpenChange,
  acompte,
  onCancelRequest,
}: MyAcompteDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de la demande</DialogTitle>
          <DialogDescription className="sr-only">
            Informations détaillées de votre demande d&apos;acompte
          </DialogDescription>
        </DialogHeader>

        {acompte && (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 py-5">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Montant demandé
              </span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatMontant(acompte.montant)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Statut" labelClassName={LABEL}>
                <AcompteStatusBadge status={acompte.status} unknownAsPending />
              </DetailItem>
              {acompte.status === 'APPROVED' && (
                <DetailItem label="Paiement" labelClassName={LABEL}>
                  <PaymentStatusBadge isPaid={acompte.isPaid} />
                </DetailItem>
              )}
              {acompte.isPaid && acompte.paidDate && (
                <DetailItem label="Payé le" labelClassName={LABEL}>
                  <span className="text-sm font-medium text-foreground">
                    {formatDateTime(acompte.paidDate)}
                  </span>
                </DetailItem>
              )}
            </div>

            {acompte.raison && (
              <DetailItem label="Raison" labelClassName={LABEL}>
                <span className="text-sm font-medium text-foreground">{acompte.raison}</span>
              </DetailItem>
            )}

            {acompte.validatedBy && (
              <div className="border-t pt-4">
                <h4 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Traitement
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Traité par" labelClassName={LABEL}>
                    <span className="text-sm font-medium text-foreground">
                      {acompte.validatedBy.firstName} {acompte.validatedBy.lastName}
                    </span>
                  </DetailItem>
                  <DetailItem label="Date de traitement" labelClassName={LABEL}>
                    <span className="text-sm font-medium text-foreground">
                      {formatDateTime(acompte.validatedAt)}
                    </span>
                  </DetailItem>
                </div>
                {acompte.rejectionReason && (
                  <div className="col-span-2 mt-3 rounded-lg border-l-4 border-destructive bg-destructive/10 p-3">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Motif du refus
                    </span>
                    <p className="mt-1 text-sm font-medium text-destructive italic">
                      {acompte.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {acompte.status === 'PENDING' && (
              <div className="flex items-center gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                <Clock className="size-4 shrink-0" />
                <span>Votre demande est en attente de validation.</span>
              </div>
            )}

            <div className="border-t pt-3 text-xs text-muted-foreground">
              Demandé le {formatDateTime(acompte.createdAt)}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {acompte?.status === 'PENDING' && (
            <Button type="button" variant="destructive" onClick={() => onCancelRequest(acompte)}>
              Annuler la demande
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
