import type { CSSProperties } from 'react'
import type { PlanningAbsenceDay } from '@/features/planning/lib/absenceDays'
import {
  getAbsenceColor,
  getAbsenceTypeName,
  getDayCellTitle,
  hexToRgba,
} from '@/features/planning/lib/absenceCellStyle'
import type { PlanningDate } from '@/features/planning/lib/planningDates'
import { cn } from '@/lib/utils'
import { formatDayHours } from '../lib/formatters'
import { dayFillRatio } from '../lib/monthCalendar'

type CalendarDayCellProps = {
  date: PlanningDate
  /** Le jour appartient au mois affiché (sinon estompé) */
  inMonth: boolean
  /** Temps de travail net des services débutés ce jour, en secondes */
  workSeconds: number
  /** Un pointage de ce jour est en cours */
  running: boolean
  absence: PlanningAbsenceDay | undefined
  userName: string
  onSelect: (dateKey: string) => void
}

/** Étiquette d'absence : teinte du type, bord gauche plein, hachures si en attente. */
function absenceStyle(day: PlanningAbsenceDay): CSSProperties {
  const color = getAbsenceColor(day.absence)
  const tint = hexToRgba(color, day.kind === 'non-decompte' ? 0.08 : 0.18)
  return day.absence.status === 'PENDING'
    ? {
        borderLeftColor: color,
        backgroundImage: `repeating-linear-gradient(135deg, ${tint} 0 4px, transparent 4px 8px)`,
      }
    : { borderLeftColor: color, backgroundColor: tint }
}

/**
 * Case d'un jour du calendrier de la fiche : numéro, absence (type et couleur), heures nettes
 * travaillées et jauge (8 h = pleine). Un clic ouvre les pointages de ce jour.
 */
export function CalendarDayCell({
  date,
  inMonth,
  workSeconds,
  running,
  absence,
  userName,
  onSelect,
}: CalendarDayCellProps) {
  const hoursLabel = formatDayHours(workSeconds)
  const halfDay = absence && absence.kind !== 'reprise' && absence.fraction === 0.5
  const title = [
    getDayCellTitle(userName, date, absence),
    hoursLabel && `${hoursLabel} travaillées`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={() => onSelect(date.dateStr)}
      className={cn(
        'group relative flex min-h-16 min-w-0 flex-col gap-1 rounded-lg border p-1 text-left transition-colors hover:border-primary/50 hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-24 sm:p-1.5 3xl:min-h-28',
        date.isHoliday ? 'bg-hatch-holiday' : date.isWeekend ? 'bg-muted/50' : 'bg-card',
        date.isToday && 'border-primary ring-1 ring-primary/40',
        !inMonth && 'opacity-40',
      )}
    >
      <span className="flex items-center justify-between gap-1">
        <span
          className={cn(
            'inline-flex size-5 items-center justify-center rounded-full text-xs font-medium tabular-nums sm:size-6',
            date.isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
          )}
        >
          {date.dayNumber}
        </span>
        {running && <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />}
      </span>

      {absence ? (
        <span
          className={cn(
            'truncate rounded-sm border-l-[3px] px-1 py-0.5 text-[10px] leading-tight font-medium text-foreground max-sm:h-1.5 max-sm:p-0 sm:text-xs',
            absence.kind === 'non-decompte' && 'text-muted-foreground',
          )}
          style={absenceStyle(absence)}
        >
          <span className="max-sm:sr-only">
            {halfDay && '½ '}
            {getAbsenceTypeName(absence.absence)}
          </span>
        </span>
      ) : (
        date.holidayName && (
          <span className="truncate text-[10px] text-destructive max-sm:sr-only sm:text-xs">
            {date.holidayName}
          </span>
        )
      )}

      {workSeconds > 0 && (
        <span className="mt-auto flex flex-col gap-1">
          <span className="font-mono text-[11px] font-semibold text-foreground tabular-nums sm:text-sm">
            {hoursLabel}
          </span>
          <span className="h-1 overflow-hidden rounded-full bg-muted max-sm:hidden">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${dayFillRatio(workSeconds) * 100}%` }}
            />
          </span>
        </span>
      )}
    </button>
  )
}
