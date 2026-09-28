import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  formatContractHours,
  formatDifference,
  formatJours,
  getDifferenceClass,
  type ContractRow,
} from '../lib/contractFormat'

type ContractForecastProps = {
  row: ContractRow
  className?: string
}

/**
 * Prévision des heures d'un employé à la fin du mois (D10) et son écart au contrat, avec le détail
 * du calcul au survol ou au focus. « - » sans contrat.
 */
export function ContractForecast({ row, className }: ContractForecastProps) {
  if (row.heuresPrevisionnelles == null) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  const jours = row.joursOuvresRestants ?? 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex flex-col items-center rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            className,
          )}
        >
          <span className="font-semibold text-foreground underline decoration-dotted underline-offset-4">
            {formatContractHours(row.heuresPrevisionnelles)}
          </span>
          <span
            className={cn('text-xs font-medium', getDifferenceClass(row.differencePrevisionnelle))}
          >
            {formatDifference(row.differencePrevisionnelle)}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Total actuel : {formatContractHours(row.heuresTotal)}</p>
        <p>
          Reste prévu : {formatContractHours(row.heuresRestantesPrevues)} ({formatJours(jours)} jour
          {jours > 1 ? 's' : ''} ouvré{jours > 1 ? 's' : ''} à{' '}
          {formatContractHours(row.heuresParJourContrat)})
        </p>
        <p className="opacity-80">
          Aujourd&apos;hui compris, moins les heures déjà pointées. Fériés et absences sont déjà
          comptés.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
