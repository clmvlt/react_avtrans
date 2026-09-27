import { useFitToViewport } from '@/hooks/useFitToViewport'
import { cn } from '@/lib/utils'
import type { AbsenceDTO, AbsenceTypeDTO } from '@/models'
import type { PlanningUserDTO } from '@/services/absences'
import { buildAbsenceDayMap, countAbsentsByDay, summarizeUserPeriod } from '../lib/absenceDays'
import type { PlanningDate } from '../lib/planningDates'
import { getPlanningLayout } from '../lib/planningLayout'
import { PlanningFooterRow } from './PlanningFooterRow'
import { PlanningHeaderRows } from './PlanningHeaderRows'
import { PlanningLegend } from './PlanningLegend'
import { PlanningUserRow } from './PlanningUserRow'

type PlanningGridProps = {
  users: PlanningUserDTO[]
  dates: PlanningDate[]
  absenceTypes: AbsenceTypeDTO[]
  onAbsenceClick: (absence: AbsenceDTO) => void
  /** Période suivante en cours de chargement : la grille actuelle est estompée. */
  isStale?: boolean
}

/**
 * Grille employés × jours qui tient dans la fenêtre : elle défile à l'intérieur (en-tête des
 * jours en haut, noms à gauche, totaux à droite et pied « Absents » collés), la légende reste
 * visible dessous. Les jours se partagent la largeur disponible : un mois remplit un grand écran
 * sans défilement horizontal, une longue plage défile.
 */
export function PlanningGrid({
  users,
  dates,
  absenceTypes,
  onAbsenceClick,
  isStale = false,
}: PlanningGridProps) {
  const { ref, maxHeight } = useFitToViewport<HTMLDivElement>({ bottomOffset: 16, minHeight: 360 })
  const layout = getPlanningLayout(dates.length)
  const rows = users.map((user) => {
    const dayMap = buildAbsenceDayMap(user.absences, dates)
    return { user, dayMap, summary: summarizeUserPeriod(dayMap) }
  })
  const absents = countAbsentsByDay(
    rows.map((row) => row.dayMap),
    dates,
  )

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card transition-opacity [--planning-bar-faint:12%] [--planning-bar-fill:35%] dark:[--planning-bar-faint:22%] dark:[--planning-bar-fill:55%]',
        isStale && 'opacity-60',
      )}
      style={{ maxHeight }}
    >
      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        <div
          className={cn(
            '[--planning-name-col:6rem] [--planning-total-col:3.5rem] sm:[--planning-name-col:11rem] sm:[--planning-total-col:5rem] 2xl:[--planning-name-col:13rem]',
            layout.dayMinClass,
          )}
          style={{ minWidth: layout.minWidth }}
        >
          <PlanningHeaderRows dates={dates} layout={layout} />
          {rows.map(({ user, dayMap, summary }, index) => (
            <PlanningUserRow
              key={user.uuid ?? index}
              user={user}
              dates={dates}
              dayMap={dayMap}
              summary={summary}
              layout={layout}
              onAbsenceClick={onAbsenceClick}
            />
          ))}
          <PlanningFooterRow dates={dates} counts={absents} layout={layout} />
        </div>
      </div>

      <PlanningLegend absenceTypes={absenceTypes} dates={dates} />
    </div>
  )
}
