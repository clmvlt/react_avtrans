import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import type { AbsenceDTO } from '@/models'
import {
  getAbsenceIcon,
  getAbsenceIconStyle,
  getDayCellClasses,
  getDayCellStyle,
} from '../lib/absenceCellStyle'
import type { PlanningDate } from '../lib/planningDates'

type PlanningDayCellProps = {
  date: PlanningDate
  absence: AbsenceDTO | undefined
  compact: boolean
  onAbsenceClick: (absence: AbsenceDTO) => void
}

/**
 * Case jour × employé : couleur du type d'absence (demi-journée en dégradé), symbole de statut
 * (✓ ? ✗) et AM / PM hors mode compact. Une case portant une absence ouvre son détail (au clic,
 * ou au clavier avec Entrée / Espace).
 */
export function PlanningDayCell({ date, absence, compact, onAbsenceClick }: PlanningDayCellProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!absence || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    onAbsenceClick(absence)
  }

  return (
    <div
      className={cn(
        'relative flex items-center justify-center border-l transition-colors',
        compact ? 'min-h-[36px]' : 'min-h-[52px]',
        absence && 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        ...getDayCellClasses(absence, date),
      )}
      style={getDayCellStyle(absence)}
      role={absence ? 'button' : undefined}
      tabIndex={absence ? 0 : undefined}
      aria-label={absence ? "Détails de l'absence" : undefined}
      onClick={absence ? () => onAbsenceClick(absence) : undefined}
      onKeyDown={absence ? handleKeyDown : undefined}
    >
      {absence && (
        <>
          <span
            className={cn('font-bold', compact ? 'text-sm' : 'text-lg')}
            style={getAbsenceIconStyle(absence)}
          >
            {getAbsenceIcon(absence)}
          </span>
          {!compact && absence.period === 'MORNING' && (
            <span className="absolute bottom-0.5 text-[8px] leading-none text-muted-foreground">
              AM
            </span>
          )}
          {!compact && absence.period === 'AFTERNOON' && (
            <span className="absolute bottom-0.5 text-[8px] leading-none text-muted-foreground">
              PM
            </span>
          )}
        </>
      )}
    </div>
  )
}
