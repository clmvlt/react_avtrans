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
    <div className="flex min-w-0 items-center gap-1.5 max-sm:w-full">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Période précédente"
        onClick={onPrevious}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground sm:min-w-44 sm:flex-none">
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
      <Button type="button" variant="secondary" size="sm" className="ml-1" onClick={onToday}>
        Aujourd&apos;hui
      </Button>
    </div>
  )
}
