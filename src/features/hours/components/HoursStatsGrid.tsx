import { Calendar, CalendarDays, CalendarRange, History, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { formatDecimalHours, type HoursTotals } from '../lib/hoursFormat'

type HoursStatsGridProps = {
  totals: HoursTotals
}

/** Totaux de tous les employés : aujourd'hui, semaine, mois, mois dernier, année. */
export function HoursStatsGrid({ totals }: HoursStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard
        icon={CalendarDays}
        iconClassName="bg-violet-500/10 text-violet-500"
        label="Aujourd'hui"
        value={formatDecimalHours(totals.day)}
      />
      <StatCard
        icon={CalendarRange}
        iconClassName="bg-green-500/10 text-green-500"
        label="Cette semaine"
        value={formatDecimalHours(totals.week)}
      />
      <StatCard
        icon={Calendar}
        iconClassName="bg-amber-500/10 text-amber-500"
        label="Ce mois"
        value={formatDecimalHours(totals.month)}
      />
      <StatCard
        icon={History}
        iconClassName="bg-sky-500/10 text-sky-500"
        label="Mois dernier"
        value={formatDecimalHours(totals.lastMonth)}
      />
      <StatCard
        icon={TrendingUp}
        iconClassName="bg-purple-500/10 text-purple-500"
        label="Cette année"
        value={formatDecimalHours(totals.year)}
      />
    </div>
  )
}
