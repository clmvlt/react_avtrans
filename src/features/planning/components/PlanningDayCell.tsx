import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { AbsenceDTO } from '@/models'
import type { PlanningAbsenceDay } from '../lib/absenceDays'
import {
  getAbsenceBarClass,
  getAbsenceBarStyle,
  getAbsenceTypeName,
  getDayColumnClass,
  getDayCellTitle,
} from '../lib/absenceCellStyle'
import type { PlanningDate, PlanningDensity } from '../lib/planningDates'

type PlanningDayCellProps = {
  date: PlanningDate
  day: PlanningAbsenceDay | undefined
  density: PlanningDensity
  userName: string
  /** Premier jour affiché : pas de séparateur de semaine. */
  isFirst: boolean
  onAbsenceClick: (absence: AbsenceDTO) => void
}

/**
 * Case jour × employé. Fond de la colonne (aujourd'hui, férié hachuré, week-end), puis la barre
 * de l'absence : pleine si le jour est décompté (moitié pour une demi-journée), hachurée si la
 * demande est en attente, pâle et pointillée pour le samedi de reprise, simple trait pour un jour
 * non décompté (dimanche, férié). En vue semaine, le type est écrit au début de la barre. Une case
 * portant une absence ouvre son détail (clic, Entrée ou Espace).
 */
export function PlanningDayCell({
  date,
  day,
  density,
  userName,
  isFirst,
  onAbsenceClick,
}: PlanningDayCellProps) {
  const absence = day?.absence
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!absence || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onAbsenceClick(absence)
  }
  const showLabel =
    density === 'week' && day && day.kind !== 'non-decompte' && (day.isStart || isFirst)

  return (
    <div
      className={cn(
        'relative min-w-0 border-l border-border/60',
        date.dayOfWeek === 1 && !isFirst && 'border-l-foreground/25',
        // Barre qui continue depuis la veille : pas de trait de case sous sa teinte
        day && !day.isStart && 'border-l-transparent',
        getDayColumnClass(date),
        absence &&
          'cursor-pointer focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset',
      )}
      title={getDayCellTitle(userName, date, day)}
      role={absence ? 'button' : undefined}
      tabIndex={absence ? 0 : undefined}
      aria-label={
        absence ? `Détails de l'absence : ${getDayCellTitle(userName, date, day)}` : undefined
      }
      onClick={absence ? () => onAbsenceClick(absence) : undefined}
      onKeyDown={absence ? handleKeyDown : undefined}
    >
      {day && (
        <div
          className={getAbsenceBarClass(day, density)}
          style={getAbsenceBarStyle(day)}
          aria-hidden="true"
        >
          {showLabel && (
            <span className="flex h-full min-w-0 items-center px-1.5 text-[11px] font-medium text-foreground max-sm:hidden">
              <span className="truncate">
                {getAbsenceTypeName(day.absence)}
                {day.absence.status === 'PENDING' && ' ?'}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
