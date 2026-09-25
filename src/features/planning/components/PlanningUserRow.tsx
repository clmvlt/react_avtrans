import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import type { AbsenceDTO } from '@/models'
import type { PlanningUserDTO } from '@/services/absences'
import { indexAbsencesByDate } from '../lib/absenceIndex'
import type { PlanningDate } from '../lib/planningDates'
import { PlanningDayCell } from './PlanningDayCell'

type PlanningUserRowProps = {
  user: PlanningUserDTO
  dates: PlanningDate[]
  gridColumns: string
  compact: boolean
  onAbsenceClick: (absence: AbsenceDTO) => void
}

/** Ligne d'un employé : identité, rôle, lien vers ses absences, puis une case par jour. */
export function PlanningUserRow({
  user,
  dates,
  gridColumns,
  compact,
  onAbsenceClick,
}: PlanningUserRowProps) {
  const absenceByDate = indexAbsencesByDate(user.absences, dates)

  return (
    <div className="grid border-b last:border-b-0" style={{ gridTemplateColumns: gridColumns }}>
      {/* Colonne des noms non collante : parité Vue (en mobile, le défilement masque les noms) */}
      <div className="flex items-center gap-3 border-r bg-card px-4 py-3">
        <UserAvatar user={user} size="md" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {user.firstName} {user.lastName}
          </span>
          {user.role && (
            <span
              className="text-xs font-medium"
              style={user.role.color ? { color: user.role.color } : undefined}
            >
              {user.role.nom}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link
            to={`/absences?userUuid=${user.uuid}`}
            title="Voir les absences"
            aria-label="Voir les absences"
          >
            <CalendarDays className="size-3.5" />
          </Link>
        </Button>
      </div>
      {dates.map((date, index) => (
        <PlanningDayCell
          // dateStr peut être dupliqué (B-03) : l'index garantit une clé unique
          key={`${date.dateStr}-${index}`}
          date={date}
          absence={absenceByDate.get(date.dateStr)}
          compact={compact}
          onAbsenceClick={onAbsenceClick}
        />
      ))}
    </div>
  )
}
