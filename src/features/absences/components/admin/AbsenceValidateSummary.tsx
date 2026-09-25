import type { AbsenceDTO } from '@/models'
import { getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong } from '../../lib/dateFormat'
import { SummaryRow } from '../SummaryRow'

type AbsenceValidateSummaryProps = {
  absence: AbsenceDTO | null
}

/**
 * Résumé d'une absence dans le dialog d'approbation / de refus. Deux lignes « Période » pour une
 * demi-journée (dates puis moment), comme le Vue.
 */
export function AbsenceValidateSummary({ absence }: AbsenceValidateSummaryProps) {
  if (!absence) return null

  return (
    <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
      <SummaryRow label="Employé">
        {absence.user?.firstName} {absence.user?.lastName}
      </SummaryRow>
      <SummaryRow label="Période">
        {formatDateLong(absence.startDate)}
        {absence.startDate !== absence.endDate && <span> → {formatDateLong(absence.endDate)}</span>}
      </SummaryRow>
      {isHalfDay(absence.period) && (
        <SummaryRow label="Période">{getPeriodLabel(absence.period)}</SummaryRow>
      )}
      <SummaryRow label="Motif">{absence.reason || '-'}</SummaryRow>
    </div>
  )
}
