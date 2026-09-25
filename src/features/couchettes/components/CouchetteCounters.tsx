import { BedDouble, CalendarCheck } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'

type CouchetteCountersProps = {
  /** Nuits du mois parmi la page affichée (B-10). */
  monthCount: number
  totalElements: number
}

/** Compteurs « Ce mois » et « Total » de /mycouchettes. */
export function CouchetteCounters({ monthCount, totalElements }: CouchetteCountersProps) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:gap-3" aria-label="Compteurs de couchettes">
      <StatCard
        variant="compact"
        icon={CalendarCheck}
        iconClassName="bg-primary/15 text-primary"
        label="Ce mois"
        value={monthCount}
      />
      <StatCard
        variant="compact"
        icon={BedDouble}
        iconClassName="bg-primary/15 text-primary"
        label="Total"
        value={totalElements}
      />
    </section>
  )
}
