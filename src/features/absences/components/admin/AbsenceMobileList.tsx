import { CalendarX } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import type { AbsenceDTO } from '@/models'
import { calculateAbsenceDuration, getPeriodLabel, isHalfDay } from '@/utils/absenceFormatters'
import { formatDateLong, formatDateTime } from '../../lib/dateFormat'
import { AbsenceHeuresValue } from '../AbsenceHeuresValue'
import { AbsenceStatusBadge } from '../AbsenceStatusBadge'
import { AbsenceTypeBadge } from '../AbsenceTypeBadge'
import { AbsenceActionsDropdown } from './AbsenceActionsDropdown'
import type { AbsenceActionHandler } from './absenceRowActions'

type AbsenceMobileListProps = {
  absences: AbsenceDTO[]
  totalElements: number
  onAction: AbsenceActionHandler
}

/** Liste des absences en cartes (sous `md`), avec menu d'actions par carte. */
export function AbsenceMobileList({ absences, totalElements, onAction }: AbsenceMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{totalElements} absence(s)</p>

      {absences.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <CalendarX className="size-10 opacity-50" />
          <p>Aucune absence trouvée</p>
        </div>
      )}

      {absences.map((absence) => (
        <div key={absence.uuid} className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={absence.user} />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {absence.user?.firstName} {absence.user?.lastName}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(absence.createdAt)}
                </span>
              </div>
            </div>
            <AbsenceActionsDropdown absence={absence} onAction={onAction} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AbsenceTypeBadge absence={absence} />
            <AbsenceStatusBadge status={absence.status} />
          </div>

          <div className="mt-2 text-sm">
            <span className="font-medium text-foreground">
              {formatDateLong(absence.startDate)}
              {absence.startDate !== absence.endDate && (
                <span> → {formatDateLong(absence.endDate)}</span>
              )}
            </span>
            <span className="ml-2 text-muted-foreground">
              ({calculateAbsenceDuration(absence.startDate, absence.endDate, absence.period)}
              {isHalfDay(absence.period) && ` · ${getPeriodLabel(absence.period)}`})
            </span>
          </div>

          <AbsenceHeuresValue absence={absence} layout="inline" className="mt-1 text-sm" />
        </div>
      ))}
    </div>
  )
}
