import { cn } from '@/lib/utils'
import { formatPercentage, getPercentageClass, type ContractRow } from '../lib/contractFormat'
import { ContractForecastDetails } from './ContractForecastDetails'
import { ContractProgressBar } from './ContractProgressBar'

type ContractForecastProps = {
  row: ContractRow
  /** Jours ouvrés restants du mois sans les absences, pour le détail du calcul. */
  joursOuvresRestantsMois: number | null
  /** `cell` : pourcentage et barre, comme la colonne « Réalisation » ; `tile` : pourcentage seul. */
  variant?: 'cell' | 'tile'
}

/**
 * Réalisation prévue à la fin du mois (D10), présentée comme la réalisation actuelle, avec un
 * bouton « ? » qui ouvre le détail du calcul. « - » sans contrat.
 */
export function ContractForecast({
  row,
  joursOuvresRestantsMois,
  variant = 'cell',
}: ContractForecastProps) {
  const pct = row.pourcentagePrevisionnel
  if (pct == null) return <span className="text-sm text-muted-foreground">-</span>

  const value = (
    <span className="inline-flex items-center gap-0.5">
      <span className={cn('text-sm font-bold', getPercentageClass(pct))}>
        {formatPercentage(pct)}
      </span>
      <ContractForecastDetails row={row} joursOuvresRestantsMois={joursOuvresRestantsMois} />
    </span>
  )

  if (variant === 'tile') return value

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Le « ? » déborde à droite pour garder le pourcentage centré au-dessus de la barre */}
      <span className="-mr-6">{value}</span>
      <ContractProgressBar percentage={pct} className="h-1.5 w-16" />
    </div>
  )
}
