import { cn } from '@/lib/utils'
import type { PlanningDate, PlanningDensity } from '../lib/planningDates'

type PlanningDayHeaderCellProps = {
  date: PlanningDate
  density: PlanningDensity
  /** Premier jour affiché : pas de séparateur de semaine. */
  isFirst: boolean
}

/**
 * En-tête d'un jour : initiale (ou jour abrégé en vue semaine) et numéro, numéro d'aujourd'hui
 * sur pastille, férié en rouge sur hachures (nom affiché en vue semaine, sinon en info-bulle),
 * week-end estompé, séparateur marqué le lundi.
 */
export function PlanningDayHeaderCell({ date, density, isFirst }: PlanningDayHeaderCellProps) {
  const { isToday, isHoliday, isWeekend } = date
  const wide = density === 'week'

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center justify-center gap-0.5 border-l border-border/60 px-0.5 py-1',
        date.dayOfWeek === 1 && !isFirst && 'border-l-foreground/25',
        isHoliday && 'bg-hatch-holiday',
      )}
      title={isHoliday ? `${date.label} · Férié : ${date.holidayName}` : date.label}
    >
      <span
        className={cn(
          'leading-none uppercase',
          wide ? 'text-[11px]' : 'text-[10px]',
          isHoliday ? 'font-semibold text-destructive' : 'text-muted-foreground',
          !isHoliday && isWeekend && 'text-muted-foreground/60',
        )}
      >
        {wide ? (
          <>
            <span className="sm:hidden">{date.dayName.charAt(0)}</span>
            <span className="max-sm:hidden">{date.dayName.replace('.', '')}</span>
          </>
        ) : (
          date.dayName.charAt(0)
        )}
      </span>
      <span
        className={cn(
          'flex items-center justify-center rounded-full leading-none font-semibold tabular-nums',
          wide ? 'size-6 text-sm' : density === 'month' ? 'size-5 text-xs' : 'size-4 text-[10px]',
          isToday && 'bg-primary text-primary-foreground',
          !isToday && isHoliday && 'text-destructive',
          !isToday && !isHoliday && isWeekend && 'text-muted-foreground/70',
          !isToday && !isHoliday && !isWeekend && 'text-foreground',
        )}
      >
        {date.dayNumber}
      </span>
      {wide && isHoliday && (
        <span className="max-w-full truncate text-[10px] leading-tight font-medium text-destructive max-sm:hidden">
          {date.holidayName}
        </span>
      )}
    </div>
  )
}
