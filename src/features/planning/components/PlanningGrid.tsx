import { cn } from '@/lib/utils'
import type { AbsenceDTO, AbsenceTypeDTO } from '@/models'
import type { PlanningUserDTO } from '@/services/absences'
import { getGridColumns, isCompactGrid, type PlanningDate } from '../lib/planningDates'
import { PlanningDayHeaderCell } from './PlanningDayHeaderCell'
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

/** Grille employés × jours (défilement horizontal au-delà de 800 px), puis légende. */
export function PlanningGrid({
  users,
  dates,
  absenceTypes,
  onAbsenceClick,
  isStale = false,
}: PlanningGridProps) {
  const gridColumns = getGridColumns(dates.length)
  const compact = isCompactGrid(dates.length)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border bg-card shadow-sm transition-opacity',
        isStale && 'opacity-60',
      )}
    >
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid border-b bg-muted/50" style={{ gridTemplateColumns: gridColumns }}>
            <div className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Employé
            </div>
            {dates.map((date, index) => (
              <PlanningDayHeaderCell
                key={`${date.dateStr}-${index}`}
                date={date}
                compact={compact}
              />
            ))}
          </div>

          {users.map((user, index) => (
            <PlanningUserRow
              key={user.uuid ?? index}
              user={user}
              dates={dates}
              gridColumns={gridColumns}
              compact={compact}
              onAbsenceClick={onAbsenceClick}
            />
          ))}
        </div>
      </div>

      <PlanningLegend absenceTypes={absenceTypes} />
    </div>
  )
}
