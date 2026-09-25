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
import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration, getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong, formatDateTime } from '../../lib/dateFormat'
import { AbsenceStatusBadge } from '../AbsenceStatusBadge'
import { AbsenceTypeBadge } from '../AbsenceTypeBadge'
import { DetailItem } from '../DetailItem'

type MyAbsenceDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  absence: AbsenceDTO | null
  onCancelRequest: (absence: AbsenceDTO) => void
}

const LABEL = 'font-medium tracking-wide'

/** Détail d'une de mes demandes d'absence (port de `MyAbsenceDetailModal.vue`). */
export function MyAbsenceDetailDialog({
  open,
  onOpenChange,
  absence,
  onCancelRequest,
}: MyAbsenceDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de la demande</DialogTitle>
          <DialogDescription className="sr-only">
            Informations détaillées de votre demande d&apos;absence
          </DialogDescription>
        </DialogHeader>

        {absence && (
          <div className="space-y-5">
            {(absence.absenceType || absence.customType) && (
              <DetailItem label="Type d'absence" labelClassName={LABEL}>
                <AbsenceTypeBadge absence={absence} appearance="outline" />
              </DetailItem>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <DetailItem label="Début" labelClassName={LABEL}>
                <span className="text-sm font-medium text-foreground">
                  {formatDateLong(absence.startDate)}
                </span>
              </DetailItem>
              <DetailItem label="Fin" labelClassName={LABEL}>
                <span className="text-sm font-medium text-foreground">
                  {formatDateLong(absence.endDate)}
                </span>
              </DetailItem>
              <DetailItem label="Durée" labelClassName={LABEL}>
                <span className="text-sm font-semibold text-primary">
                  {calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
                </span>
              </DetailItem>
              {isHalfDay(absence.period) && (
                <DetailItem label="Période" labelClassName={LABEL}>
                  <span className="text-sm font-medium text-foreground">
                    {getPeriodLabel(absence.period)}
                  </span>
                </DetailItem>
              )}
              <DetailItem label="Statut" labelClassName={LABEL}>
                <AbsenceStatusBadge status={absence.status} unknownAsPending />
              </DetailItem>
            </div>

            {absence.reason && (
              <DetailItem label="Motif" labelClassName={LABEL}>
                <span className="text-sm font-medium text-foreground">{absence.reason}</span>
              </DetailItem>
            )}

            {absence.validatedBy && (
              <div className="border-t pt-4">
                <h4 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Validation
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <DetailItem label="Traité par" labelClassName={LABEL}>
                    <span className="text-sm font-medium text-foreground">
                      {absence.validatedBy.firstName} {absence.validatedBy.lastName}
                    </span>
                  </DetailItem>
                  <DetailItem label="Date de traitement" labelClassName={LABEL}>
                    <span className="text-sm font-medium text-foreground">
                      {formatDateTime(absence.validatedAt)}
                    </span>
                  </DetailItem>
                </div>
                {absence.rejectionReason && (
                  <div className="col-span-2 mt-3 rounded-lg border-l-4 border-destructive bg-destructive/10 p-3">
                    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Motif du refus
                    </span>
                    <p className="mt-1 text-sm font-medium text-destructive italic">
                      {absence.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            )}

            {absence.status === 'PENDING' && (
              <div className="flex items-center gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
                <Clock className="size-4 shrink-0" />
                <span>Votre demande est en attente de validation.</span>
              </div>
            )}

            <div className="border-t pt-3 text-xs text-muted-foreground">
              Demandé le {formatDateTime(absence.createdAt)}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {absence?.status === 'PENDING' && (
            <Button type="button" variant="destructive" onClick={() => onCancelRequest(absence)}>
              Annuler la demande
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
