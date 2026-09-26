import { Button } from '@/components/ui/button'
import { HOURS_PERIODS, type HoursPeriod } from '../../lib/hoursPeriod'

type HoursPeriodTabsProps = {
  period: HoursPeriod
  onSelect: (period: HoursPeriod) => void
}

/** Choix de la période : Toutes, Jour, Semaine, Mois, Année. */
export function HoursPeriodTabs({ period, onSelect }: HoursPeriodTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {HOURS_PERIODS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={period === option.value ? 'default' : 'outline'}
          size="sm"
          aria-pressed={period === option.value}
          onClick={() => onSelect(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
