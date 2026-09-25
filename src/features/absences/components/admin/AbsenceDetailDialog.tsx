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
import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration, getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong, formatDateTime } from '../../lib/dateFormat'
import { AbsenceStatusBadge } from '../AbsenceStatusBadge'
import { AbsenceTypeBadge } from '../AbsenceTypeBadge'
import { DetailItem } from '../DetailItem'

type AbsenceDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  absence: AbsenceDTO | null
  onApprove: (absence: AbsenceDTO) => void
  onReject: (absence: AbsenceDTO) => void
  onEdit: (absence: AbsenceDTO) => void
}

/**
 * Détail d'une absence côté admin (port d'`AbsenceDetailModal.vue`), avec Modifier (si non
 * approuvée) et Approuver / Refuser (si en attente). « Validé par » s'affiche aussi pour un refus
 * (B-29 reproduit).
 */
export function AbsenceDetailDialog({
  open,
  onOpenChange,
  absence,
  onApprove,
  onReject,
  onEdit,
}: AbsenceDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de l&apos;absence</DialogTitle>
          <DialogDescription className="sr-only">
            Informations détaillées de l&apos;absence
          </DialogDescription>
        </DialogHeader>

        {absence && (
          <div className="space-y-5">
            <div className="border-b pb-4">
              <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">
                Employé
              </h4>
              <UserIdentity user={absence.user} size="xl" />
            </div>

            {(absence.absenceType || absence.customType) && (
              <DetailItem label="Type d'absence">
                <AbsenceTypeBadge absence={absence} appearance="tag" />
              </DetailItem>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Date de début">
                <span className="font-medium text-foreground">
                  {formatDateLong(absence.startDate)}
                </span>
              </DetailItem>
              <DetailItem label="Date de fin">
                <span className="font-medium text-foreground">
                  {formatDateLong(absence.endDate)}
                </span>
              </DetailItem>
              <DetailItem label="Durée">
                <span className="font-medium text-foreground">
                  {calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
                </span>
              </DetailItem>
              {isHalfDay(absence.period) && (
                <DetailItem label="Période">
                  <span className="font-medium text-foreground">
                    {getPeriodLabel(absence.period)}
                  </span>
                </DetailItem>
              )}
              <DetailItem label="Statut">
                <AbsenceStatusBadge status={absence.status} unknownAsPending />
              </DetailItem>
            </div>

            <DetailItem label="Motif">
              <span className="font-medium text-foreground">{absence.reason || '-'}</span>
            </DetailItem>

            {absence.validatedBy && (
              <div className="border-b pb-4">
                <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">
                  Validation
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Validé par">
                    <span className="font-medium text-foreground">
                      {absence.validatedBy.firstName} {absence.validatedBy.lastName}
                    </span>
                  </DetailItem>
                  <DetailItem label="Date de validation">
                    <span className="font-medium text-foreground">
                      {formatDateTime(absence.validatedAt)}
                    </span>
                  </DetailItem>
                </div>
                {absence.rejectionReason && (
                  <div className="mt-4 flex flex-col gap-1">
                    <span className="text-xs tracking-wider text-muted-foreground uppercase">
                      Motif du refus
                    </span>
                    <span className="font-medium text-destructive italic">
                      {absence.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Créé le">
                <span className="font-medium text-foreground">
                  {formatDateTime(absence.createdAt)}
                </span>
              </DetailItem>
              <DetailItem label="Modifié le">
                <span className="font-medium text-foreground">
                  {formatDateTime(absence.updatedAt)}
                </span>
              </DetailItem>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
          {absence && absence.status !== 'APPROVED' && (
            <Button type="button" variant="outline" onClick={() => onEdit(absence)}>
              Modifier
            </Button>
          )}
          {absence?.status === 'PENDING' && (
            <>
              <Button type="button" onClick={() => onApprove(absence)}>
                Approuver
              </Button>
              <Button type="button" variant="destructive" onClick={() => onReject(absence)}>
                Refuser
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
