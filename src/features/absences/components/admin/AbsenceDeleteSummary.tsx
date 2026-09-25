import { UserIdentity } from '@/components/shared/UserIdentity'
import type { AbsenceDTO } from '@/models'
import { getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong } from '../../lib/dateFormat'
import { AbsenceStatusBadge } from '../AbsenceStatusBadge'
import { AbsenceTypeBadge } from '../AbsenceTypeBadge'
import { DetailItem } from '../DetailItem'

type AbsenceDeleteSummaryProps = {
  absence: AbsenceDTO | null
}

/** Contenu du dialog de suppression d'une absence (port d'`AbsenceDeleteModal.vue`). */
export function AbsenceDeleteSummary({ absence }: AbsenceDeleteSummaryProps) {
  if (!absence) return null

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <p className="mb-2 font-medium text-foreground">
          Êtes-vous sûr de vouloir supprimer cette absence ?
        </p>
        <p className="text-sm font-semibold text-destructive">Cette action est irréversible.</p>
      </div>

      <div className="border-b pb-4">
        <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">Employé</h4>
        <UserIdentity user={absence.user} size="xl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DetailItem label="Date de début">
          <span className="font-medium text-foreground">{formatDateLong(absence.startDate)}</span>
        </DetailItem>
        <DetailItem label="Date de fin">
          <span className="font-medium text-foreground">{formatDateLong(absence.endDate)}</span>
        </DetailItem>
        {(absence.absenceType || absence.customType) && (
          <DetailItem label="Type d'absence">
            <AbsenceTypeBadge absence={absence} appearance="tag" />
          </DetailItem>
        )}
        {isHalfDay(absence.period) && (
          <DetailItem label="Période">
            <span className="font-medium text-foreground">{getPeriodLabel(absence.period)}</span>
          </DetailItem>
        )}
        <DetailItem label="Statut">
          <AbsenceStatusBadge status={absence.status} unknownAsPending />
        </DetailItem>
      </div>
    </div>
  )
}
