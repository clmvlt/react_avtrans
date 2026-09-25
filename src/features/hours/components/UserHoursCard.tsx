import { UserIdentity } from '@/components/shared/UserIdentity'
import { cn } from '@/lib/utils'
import { formatDecimalHours, getHoursClass, type UserHoursRow } from '../lib/hoursFormat'
import { HoursPresenceBadge } from './HoursPresenceBadge'

type UserHoursCardProps = {
  row: UserHoursRow
}

function HoursTile({ label, hours }: { label: string; hours: number }) {
  return (
    <div className="rounded bg-muted/50 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-lg font-bold', getHoursClass(hours))}>{formatDecimalHours(hours)}</p>
    </div>
  )
}

/** Carte mobile d'un employé : identité, présence, puis ses cinq compteurs d'heures. */
export function UserHoursCard({ row }: UserHoursCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <UserIdentity user={row.user} showEmail={false}>
        <HoursPresenceBadge status={row.user?.status} className="mt-1 w-fit" />
      </UserIdentity>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <HoursTile label="Jour" hours={row.hoursDay} />
        <HoursTile label="Semaine" hours={row.hoursWeek} />
        <HoursTile label="Mois" hours={row.hoursMonth} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <HoursTile label="Mois dernier" hours={row.hoursLastMonth} />
        <HoursTile label="Année" hours={row.hoursYear} />
      </div>
    </div>
  )
}
