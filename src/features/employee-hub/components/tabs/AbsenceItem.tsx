import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AbsenceHeuresValue } from '@/features/absences/components/AbsenceHeuresValue'
import { AbsenceStatusBadge } from '@/features/absences/components/AbsenceStatusBadge'
import { AbsenceTypeBadge } from '@/features/absences/components/AbsenceTypeBadge'
import { AbsenceActionsDropdown } from '@/features/absences/components/admin/AbsenceActionsDropdown'
import type { AbsenceActionHandler } from '@/features/absences/components/admin/absenceRowActions'
import { formatDateLong } from '@/features/absences/lib/dateFormat'
import { getAbsenceColor } from '@/features/planning/lib/absenceCellStyle'
import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration } from '@/utils/absenceFormatters'

type AbsenceItemProps = {
  absence: AbsenceDTO
  onAction: AbsenceActionHandler
}

/**
 * Une absence de l'employé : bande à la couleur du type, dates, durée, heures créditées (D8),
 * statut ; Approuver / Refuser visibles tant qu'elle est en attente, le reste dans « ⋮ ».
 */
export function AbsenceItem({ absence, onAction }: AbsenceItemProps) {
  const pending = absence.status === 'PENDING'
  const sameDay = !absence.endDate || absence.endDate === absence.startDate

  return (
    <li className="flex overflow-hidden rounded-xl border bg-card">
      <span className="w-1.5 shrink-0" style={{ backgroundColor: getAbsenceColor(absence) }} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <button
          type="button"
          onClick={() => onAction('details', absence)}
          className="min-w-0 flex-1 rounded-md text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="flex flex-wrap items-center gap-2">
            <AbsenceTypeBadge absence={absence} />
            <AbsenceStatusBadge status={absence.status} />
          </span>
          <span className="mt-1.5 block font-medium text-foreground">
            {formatDateLong(absence.startDate)}
            {!sameDay && <> → {formatDateLong(absence.endDate)}</>}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            {calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
            {absence.reason && ` · ${absence.reason}`}
          </span>
        </button>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <AbsenceHeuresValue absence={absence} className="text-sm sm:items-end sm:text-right" />
          <div className="flex items-center gap-1">
            {pending && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onAction('reject', absence)}
                >
                  <X className="size-4" />
                  <span className="max-[400px]:sr-only">Refuser</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-success"
                  onClick={() => onAction('approve', absence)}
                >
                  <Check className="size-4" />
                  <span className="max-[400px]:sr-only">Approuver</span>
                </Button>
              </>
            )}
            <AbsenceActionsDropdown absence={absence} onAction={onAction} />
          </div>
        </div>
      </div>
    </li>
  )
}
