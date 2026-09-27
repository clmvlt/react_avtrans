import { Link } from 'react-router'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { formatHeures } from '@/features/absences/lib/absenceDecompte'
import { cn } from '@/lib/utils'
import type { AbsenceDTO } from '@/models'
import type { PlanningUserDTO } from '@/services/absences'
import type { PlanningAbsenceDay, UserPeriodSummary } from '../lib/absenceDays'
import type { PlanningDate } from '../lib/planningDates'
import type { PlanningLayout } from '../lib/planningLayout'
import { PlanningDayCell } from './PlanningDayCell'

type PlanningUserRowProps = {
  user: PlanningUserDTO
  dates: PlanningDate[]
  dayMap: Map<string, PlanningAbsenceDay>
  summary: UserPeriodSummary
  layout: PlanningLayout
  onAbsenceClick: (absence: AbsenceDTO) => void
}

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

/**
 * Ligne d'un employé : nom collé à gauche (lien vers ses absences), une case par jour, total de
 * la période collé à droite (jours et heures créditées des absences approuvées, repère des jours
 * en attente).
 */
export function PlanningUserRow({
  user,
  dates,
  dayMap,
  summary,
  layout,
  onAbsenceClick,
}: PlanningUserRowProps) {
  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const shortName = `${user.firstName ?? ''} ${user.lastName?.charAt(0) ?? ''}.`.trim()
  const totalTitle = [
    `${numberFormat.format(summary.jours)} j décomptés, ${formatHeures(summary.heures)} créditées (absences approuvées)`,
    summary.joursEnAttente > 0 && `${numberFormat.format(summary.joursEnAttente)} j en attente`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div
      className={cn('group/row grid border-b border-border/60 last:border-b-0', layout.rowClass)}
      style={{ gridTemplateColumns: layout.template }}
    >
      <div className="sticky left-0 z-10 flex min-w-0 items-center gap-2 border-r bg-card px-2 group-hover/row:bg-muted sm:px-3">
        <UserAvatar
          user={user}
          size="sm"
          className={cn('shrink-0 max-sm:hidden', layout.density === 'dense' ? 'size-5' : 'size-6')}
        />
        <Link
          to={`/absences?userUuid=${user.uuid}`}
          className="min-w-0 truncate rounded-sm text-sm font-medium text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          title={`${fullName}${user.role?.nom ? ` · ${user.role.nom}` : ''} · voir ses absences`}
        >
          <span className="sm:hidden">{shortName}</span>
          <span className="max-sm:hidden">{fullName}</span>
        </Link>
      </div>

      {dates.map((date, index) => (
        <PlanningDayCell
          key={date.dateStr}
          date={date}
          day={dayMap.get(date.dateStr)}
          density={layout.density}
          userName={fullName}
          isFirst={index === 0}
          onAbsenceClick={onAbsenceClick}
        />
      ))}

      <div
        className="sticky right-0 z-10 flex min-w-0 flex-col items-end justify-center border-l bg-card px-2 leading-tight tabular-nums group-hover/row:bg-muted sm:px-3"
        title={totalTitle}
      >
        {summary.jours > 0 || summary.joursEnAttente > 0 ? (
          <>
            <span className="truncate text-[11px] font-semibold text-foreground sm:text-xs">
              {summary.jours > 0 ? formatHeures(summary.heures) : '—'}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              {summary.jours > 0 && `${numberFormat.format(summary.jours)} j`}
              {summary.joursEnAttente > 0 && (
                <span className="text-warning">
                  {summary.jours > 0 && ' '}+{numberFormat.format(summary.joursEnAttente)} j
                </span>
              )}
            </span>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    </div>
  )
}
