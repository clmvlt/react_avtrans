import { Calendar, CalendarDays, CalendarRange, Sun } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isPeriodRunning, livePeriodHours, type Received } from '@/lib/liveCounter'
import type { WorkedHoursDTO } from '@/services'
import { formatHours } from '@/utils/timeFormatters'

type WorkedHoursStatsProps = {
  hours: Received<WorkedHoursDTO>
}

const STATS = [
  {
    key: 'day',
    label: "Aujourd'hui",
    icon: Sun,
    iconClassName: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  },
  {
    key: 'week',
    label: 'Semaine',
    icon: CalendarDays,
    iconClassName: 'bg-green-500/15 text-green-600 dark:text-green-400',
  },
  {
    key: 'month',
    label: 'Mois',
    icon: CalendarRange,
    iconClassName: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  {
    key: 'lastMonth',
    label: 'Mois dernier',
    icon: Calendar,
    iconClassName: 'bg-primary/15 text-primary',
  },
] as const

/**
 * Heures nettes du jour, de la semaine, du mois et du mois dernier, calculées par l'API ; une
 * période en cours avance en direct. Un service compte sur son jour de début : à 3 h du matin,
 * « Aujourd'hui » ne compte pas le service de nuit commencé la veille.
 */
export function WorkedHoursStats({ hours }: WorkedHoursStatsProps) {
  const running = STATS.some(({ key }) => isPeriodRunning(hours.data[key]))
  const elapsed = useLiveElapsed(hours.receivedAt, running)

  return (
    <section
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
      aria-label="Heures travaillées"
    >
      {STATS.map((stat) => (
        <StatCard
          key={stat.key}
          variant="compact"
          icon={stat.icon}
          iconClassName={stat.iconClassName}
          label={stat.label}
          value={formatHours(livePeriodHours(hours.data[stat.key], elapsed))}
        />
      ))}
    </section>
  )
}
