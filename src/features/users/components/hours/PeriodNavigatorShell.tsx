import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PeriodNavigatorShellProps = {
  onPrevious: () => void
  previousLabel: string
  onNext: () => void
  nextLabel: string
  nextDisabled?: boolean
  /** Infobulles natives sur ‹ et › (seul le navigateur d'année en avait dans le Vue) */
  withTitles?: boolean
  /** Zone centrale (libellé de la période et sélecteur) */
  children: ReactNode
  /** Bouton de retour à la période courante (« Mois actuel »…) */
  currentLabel: string
  onCurrent: () => void
}

/** Cadre commun des navigateurs de période : ‹ période › puis retour à la période courante. */
export function PeriodNavigatorShell({
  onPrevious,
  previousLabel,
  onNext,
  nextLabel,
  nextDisabled = false,
  withTitles = false,
  children,
  currentLabel,
  onCurrent,
}: PeriodNavigatorShellProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onPrevious}
          title={withTitles ? previousLabel : undefined}
          aria-label={previousLabel}
        >
          <ChevronLeft className="size-4" />
        </Button>
        {children}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onNext}
          disabled={nextDisabled}
          title={withTitles ? nextLabel : undefined}
          aria-label={nextLabel}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={onCurrent}>
        {currentLabel}
      </Button>
    </div>
  )
}
