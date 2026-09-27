import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PeriodNavigatorProps = {
  label: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

/**
 * Flèches précédent / suivant, libellé de la période et « Aujourd'hui » (semaine et mois). Sur
 * téléphone, flèches et libellé occupent une ligne et « Aujourd'hui » passe dessous.
 */
export function PeriodNavigator({ label, onPrevious, onNext, onToday }: PeriodNavigatorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex w-full items-center gap-2 md:w-auto">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Période précédente"
          onClick={onPrevious}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-0 flex-1 text-center text-sm font-semibold text-foreground md:min-w-[180px] md:flex-none">
          {label}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Période suivante"
          onClick={onNext}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <Button type="button" variant="secondary" className="max-md:w-full" onClick={onToday}>
        Aujourd&apos;hui
      </Button>
    </div>
  )
}
