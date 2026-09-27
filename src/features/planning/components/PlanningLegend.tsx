import { cn } from '@/lib/utils'
import type { AbsenceTypeDTO } from '@/models'

type PlanningLegendProps = {
  absenceTypes: AbsenceTypeDTO[]
}

/** Symboles des cases (`getAbsenceIcon`) ; une absence approuvée prend la couleur de son type. */
const STATUS_SYMBOLS = [
  { symbol: '✓', label: 'approuvée', className: 'text-foreground' },
  { symbol: '?', label: 'en attente', className: 'text-amber-600 dark:text-amber-400' },
  { symbol: '✗', label: 'refusée', className: 'text-destructive' },
]

const LEGEND_TITLE_CLASS = 'text-xs font-semibold tracking-wide text-muted-foreground uppercase'

/**
 * Légende sous la grille : types d'absence (pastille de couleur + nom), puis signification des
 * symboles de statut et des mentions AM / PM.
 */
export function PlanningLegend({ absenceTypes }: PlanningLegendProps) {
  return (
    <div className="space-y-2 border-t bg-muted/50 px-4 py-3">
      {absenceTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className={LEGEND_TITLE_CLASS}>Types d&apos;absence</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {absenceTypes.map((type) => (
              <div
                key={type.uuid}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span
                  className="size-3.5 rounded-sm border border-border"
                  style={{ backgroundColor: type.color }}
                />
                <span>{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className={LEGEND_TITLE_CLASS}>Statut</span>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {STATUS_SYMBOLS.map((status) => (
            <span key={status.symbol} className="flex items-center gap-1.5">
              <span className={cn('font-bold', status.className)}>{status.symbol}</span>
              {status.label}
            </span>
          ))}
          <span>AM / PM : demi-journée (matin / après-midi)</span>
          <span>Cliquez sur une absence pour voir le détail</span>
        </div>
      </div>
    </div>
  )
}
