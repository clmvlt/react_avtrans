import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { formatHours } from '@/utils/timeFormatters'

type WorkedHoursStatsProps = {
  hours: { week: number; month: number; lastMonth: number }
}

/** Compteurs semaine / mois / mois dernier (le jour est affiché en direct dans la carte d'état). */
export function WorkedHoursStats({ hours }: WorkedHoursStatsProps) {
  const stats = [
    {
      label: 'Semaine',
      value: formatHours(hours.week || 0),
      icon: CalendarDays,
      iconClassName: 'bg-green-500/15 text-green-600 dark:text-green-400',
    },
    {
      label: 'Mois',
      value: formatHours(hours.month || 0),
      icon: CalendarRange,
      iconClassName: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Mois dernier',
      value: formatHours(hours.lastMonth || 0),
      icon: Calendar,
      iconClassName: 'bg-primary/15 text-primary',
    },
  ]

  return (
    <section className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Heures travaillées">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          variant="compact"
          icon={stat.icon}
          iconClassName={stat.iconClassName}
          label={stat.label}
          value={stat.value}
        />
      ))}
    </section>
  )
}
