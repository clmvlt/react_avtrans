import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration, getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateCompact } from '../../lib/dateFormat'

type MyAbsenceCancelSummaryProps = {
  absence: AbsenceDTO | null
}

/** Résumé de la demande dans le dialog « Annuler la demande » : type, période, durée, moment. */
export function MyAbsenceCancelSummary({ absence }: MyAbsenceCancelSummaryProps) {
  if (!absence) return null

  return (
    <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Type</span>
        <span className="text-right font-medium">
          {absence.absenceType?.name || absence.customType || '-'}
        </span>
      </div>
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Période</span>
        <span className="text-right font-medium">
          {formatDateCompact(absence.startDate)}
          {absence.startDate !== absence.endDate && (
            <span> → {formatDateCompact(absence.endDate)}</span>
          )}
        </span>
      </div>
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Durée</span>
        <span className="font-medium">
          {calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
        </span>
      </div>
      {isHalfDay(absence.period) && (
        <div className="flex justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Moment</span>
          <span className="font-medium">{getPeriodLabel(absence.period)}</span>
        </div>
      )}
    </div>
  )
}
