import type { LucideIcon } from 'lucide-react'
import { Calendar, CalendarDays, CalendarMinus, CalendarRange, Sun } from 'lucide-react'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isPeriodRunning, livePeriodHours, type Received } from '@/lib/liveCounter'
import { cn } from '@/lib/utils'
import type { WorkedHoursDTO } from '@/services'
import { formatHoursValue } from '../../lib/hoursPeriod'

type HoursStatsGridProps = {
  /** Heures nettes par période (D12), avec l'instant de réception */
  hours: Received<WorkedHoursDTO>
  /** Rechargement en cours : cartes estompées et inactives */
  loading: boolean
}

type HoursCard = {
  key: 'day' | 'week' | 'month' | 'year' | 'lastMonth'
  label: string
  icon: LucideIcon
  borderClass: string
  iconClass: string
}

const CARDS: HoursCard[] = [
  {
    key: 'day',
    label: 'Jour',
    icon: Sun,
    borderClass: 'border-l-violet-500',
    iconClass: 'bg-violet-500/10 text-violet-500',
  },
  {
    key: 'week',
    label: 'Semaine',
    icon: CalendarRange,
    borderClass: 'border-l-green-500',
    iconClass: 'bg-green-500/10 text-green-500',
  },
  {
    key: 'month',
    label: 'Mois',
    icon: CalendarDays,
    borderClass: 'border-l-amber-500',
    iconClass: 'bg-amber-500/10 text-amber-500',
  },
  {
    key: 'year',
    label: 'Année',
    icon: Calendar,
    borderClass: 'border-l-purple-500',
    iconClass: 'bg-purple-500/10 text-purple-500',
  },
  {
    key: 'lastMonth',
    label: 'Mois dernier',
    icon: CalendarMinus,
    borderClass: 'border-l-sky-500',
    iconClass: 'bg-sky-500/10 text-sky-500',
  },
]

/**
 * Cartes des heures renvoyées par l'API (seules les périodes présentes dans la réponse) ; une
 * période en cours avance en direct.
 */
export function HoursStatsGrid({ hours, loading }: HoursStatsGridProps) {
  const cards = CARDS.filter((card) => hours.data[card.key] !== undefined)
  const running = cards.some((card) => isPeriodRunning(hours.data[card.key]))
  const elapsed = useLiveElapsed(hours.receivedAt, running)

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3',
        loading && 'pointer-events-none opacity-50',
      )}
    >
      {cards.map(({ key, label, icon: Icon, borderClass, iconClass }) => (
        <div
          key={key}
          className={cn(
            'flex items-center gap-4 rounded-lg border-l-4 bg-muted/50 p-4',
            borderClass,
          )}
        >
          <div className={cn('flex size-12 items-center justify-center rounded-lg', iconClass)}>
            <Icon className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatHoursValue(livePeriodHours(hours.data[key], elapsed))}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
