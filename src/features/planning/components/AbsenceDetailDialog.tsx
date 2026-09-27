import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AbsenceHeuresValue } from '@/features/absences/components/AbsenceHeuresValue'
import type { AbsenceDetailDialogController } from '../hooks/useAbsenceDetailDialog'
import {
  calculateAbsenceDuration,
  formatAbsenceDate,
  formatAbsenceDateTime,
  getAbsenceStatusText,
  getAbsenceStatusVariant,
} from '../lib/absenceDetailFormat'
import { AbsenceValidationActions } from './AbsenceValidationActions'

type AbsenceDetailDialogProps = {
  controller: AbsenceDetailDialogController
}

const SECTION_CLASS = 'space-y-3 border-b pb-4'
const SECTION_TITLE_CLASS = 'text-xs font-semibold tracking-wide text-muted-foreground uppercase'

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
      {children}
    </div>
  )
}

/**
 * Détails d'une absence cliquée dans le planning, avec validation si elle est en attente et les
 * heures créditées (D8).
 */
export function AbsenceDetailDialog({ controller }: AbsenceDetailDialogProps) {
  const { absence } = controller

  return (
    <Dialog open={controller.open} onOpenChange={controller.onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Détails de l&apos;absence</DialogTitle>
          <DialogDescription>
            Informations complètes sur l&apos;absence sélectionnée
          </DialogDescription>
        </DialogHeader>

        {absence && (
          <div className="space-y-5">
            <div className={SECTION_CLASS}>
              <h4 className={SECTION_TITLE_CLASS}>Employé</h4>
              <div className="flex items-center gap-3">
                <UserAvatar user={absence.user} size="lg" />
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {absence.user?.firstName} {absence.user?.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">{absence.user?.email}</span>
                </div>
              </div>
            </div>

            {(absence.absenceType || absence.customType) && (
              <div className={SECTION_CLASS}>
                <h4 className={SECTION_TITLE_CLASS}>Type d&apos;absence</h4>
                {absence.absenceType ? (
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: absence.absenceType.color + '20',
                      color: absence.absenceType.color,
                      borderColor: absence.absenceType.color,
                    }}
                  >
                    {absence.absenceType.name}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{absence.customType}</Badge>
                )}
              </div>
            )}

            <div className={SECTION_CLASS}>
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Début">
                  <span className="font-medium text-foreground">
                    {formatAbsenceDate(absence.startDate)}
                  </span>
                </DetailItem>
                <DetailItem label="Fin">
                  <span className="font-medium text-foreground">
                    {formatAbsenceDate(absence.endDate)}
                  </span>
                </DetailItem>
                <DetailItem label="Durée">
                  <span className="font-medium text-foreground">
                    {calculateAbsenceDuration(absence.startDate, absence.endDate)}
                  </span>
                </DetailItem>
                <DetailItem label="Statut">
                  <Badge variant={getAbsenceStatusVariant(absence.status)} className="w-fit">
                    {getAbsenceStatusText(absence.status)}
                  </Badge>
                </DetailItem>
                <DetailItem label="Heures créditées">
                  <AbsenceHeuresValue absence={absence} layout="inline" />
                </DetailItem>
              </div>
            </div>

            {absence.reason && (
              <div className={SECTION_CLASS}>
                <h4 className={SECTION_TITLE_CLASS}>Motif</h4>
                <p className="leading-relaxed text-muted-foreground">{absence.reason}</p>
              </div>
            )}

            {absence.validatedBy && (
              <div className={SECTION_CLASS}>
                <h4 className={SECTION_TITLE_CLASS}>Validation</h4>
                <div className="grid grid-cols-2 gap-4">
                  <DetailItem label="Validé par">
                    <span className="font-medium text-foreground">
                      {absence.validatedBy.firstName} {absence.validatedBy.lastName}
                    </span>
                  </DetailItem>
                  <DetailItem label="Date">
                    <span className="font-medium text-foreground">
                      {formatAbsenceDateTime(absence.validatedAt)}
                    </span>
                  </DetailItem>
                </div>
                {absence.rejectionReason && (
                  <div className="mt-3 rounded-md bg-destructive/10 p-3">
                    <span className="text-xs tracking-wide text-muted-foreground uppercase">
                      Motif du refus
                    </span>
                    <p className="mt-1 text-destructive italic">{absence.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}

            {absence.status === 'PENDING' && (
              <AbsenceValidationActions
                showRejectInput={controller.showRejectInput}
                onStartReject={controller.startReject}
                rejectionReason={controller.rejectionReason}
                onRejectionReasonChange={controller.setRejectionReason}
                isValidating={controller.isValidating}
                onApprove={controller.approve}
                onConfirmReject={controller.confirmReject}
                onCancelReject={controller.cancelReject}
              />
            )}

            <div className="border-t pt-4">
              <Link
                to="/absences"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                Gérer les absences
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
