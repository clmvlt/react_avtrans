import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PeriodNavigatorProps = {
  label: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

/** Flèches précédent / suivant, libellé de la période et « Aujourd'hui » (semaine et mois). */
export function PeriodNavigator({ label, onPrevious, onNext, onToday }: PeriodNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Période précédente"
        onClick={onPrevious}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[140px] text-center text-sm font-semibold text-foreground md:min-w-[180px]">
        {label}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Période suivante"
        onClick={onNext}
      >
        <ChevronRight className="size-4" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="hidden md:inline-flex"
        onClick={onToday}
      >
        Aujourd&apos;hui
      </Button>
      <Button type="button" variant="secondary" size="sm" className="md:hidden" onClick={onToday}>
        Auj.
      </Button>
    </div>
  )
}
