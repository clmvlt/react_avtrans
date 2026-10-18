import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Calendar, CalendarDays, CalendarRange, Sun } from 'lucide-react'
import { useDayKey } from '@/hooks/useDayChange'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isPeriodRunning, livePeriodHours, type Received } from '@/lib/liveCounter'
import { cn } from '@/lib/utils'
import { formatWorkdayLabel } from '@/lib/workday'
import type { WorkedHoursDTO } from '@/services'
import { formatHoursMinutes } from '@/utils/timeFormatters'

type WorkedHoursStatsProps = {
  hours: Received<WorkedHoursDTO>
}

type StatItem = {
  key: 'day' | 'week' | 'month' | 'lastMonth'
  label: string
  icon: LucideIcon
  iconClass: string
}

const STATS: StatItem[] = [
  { key: 'day', label: "Aujourd'hui", icon: Sun, iconClass: 'bg-violet-500/10 text-violet-500' },
  {
    key: 'week',
    label: 'Semaine',
    icon: CalendarDays,
    iconClass: 'bg-green-500/10 text-green-500',
  },
  { key: 'month', label: 'Mois', icon: CalendarRange, iconClass: 'bg-amber-500/10 text-amber-500' },
  {
    key: 'lastMonth',
    label: 'Mois dernier',
    icon: Calendar,
    iconClass: 'bg-primary/10 text-primary',
  },
]

/**
 * Heures nettes de l'employé selon l'API : journée de travail en cours (« Journée du 12/10 » pour
 * un service de nuit commencé la veille), semaine, mois, mois dernier. Une période avec un service
 * en cours avance en direct.
 */
export function WorkedHoursStats({ hours }: WorkedHoursStatsProps) {
  const titleId = useId()
  const todayKey = useDayKey()
  const running = STATS.some(({ key }) => isPeriodRunning(hours.data[key]))
  const elapsed = useLiveElapsed(hours.receivedAt, running)

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h2 id={titleId} className="text-sm font-semibold text-foreground">
        Heures travaillées
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STATS.map(({ key, label, icon: Icon, iconClass }) => (
          <div key={key} className="flex items-center gap-3 rounded-xl border bg-card p-3 sm:p-4">
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10',
                iconClass,
              )}
            >
              <Icon className="size-4 sm:size-5" />
            </div>
            <div>
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase sm:text-xs">
                {key === 'day' ? formatWorkdayLabel(hours.data.jour, todayKey) : label}
              </p>
              <p className="font-mono text-lg font-bold text-foreground sm:text-xl">
                {formatHoursMinutes(livePeriodHours(hours.data[key], elapsed))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
