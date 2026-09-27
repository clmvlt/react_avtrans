import { useId } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Calendar, CalendarDays, CalendarRange, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkedHoursDTO } from '@/services'
import { formatHoursMinutes } from '@/utils/timeFormatters'

type WorkedHoursStatsProps = {
  hours: WorkedHoursDTO
}

type StatItem = {
  key: keyof WorkedHoursDTO
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

/** Heures travaillées de l'employé : aujourd'hui, semaine, mois, mois dernier. */
export function WorkedHoursStats({ hours }: WorkedHoursStatsProps) {
  const titleId = useId()

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
                {label}
              </p>
              <p className="font-mono text-lg font-bold text-foreground sm:text-xl">
                {formatHoursMinutes(hours[key])}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
