import { ContractForecast } from '@/features/hours/components/ContractForecast'
import { ContractProgressBar } from '@/features/hours/components/ContractProgressBar'
import {
  formatContractHours,
  formatDifference,
  formatPercentage,
  getDifferenceClass,
  getPercentageClass,
  type ContractRow,
} from '@/features/hours/lib/contractFormat'
import { cn } from '@/lib/utils'

type ContractProgressProps = {
  /** Comparaison du mois, déjà en direct */
  row: ContractRow
  /** Réalisation prévue en fin de mois (mois en cours ou à venir) */
  showForecast: boolean
}

/**
 * Avancement du mois par rapport au contrat : total (effectuées + créditées) sur le contrat, barre
 * de réalisation, écart et réalisation prévue en fin de mois (D8, D10).
 */
export function ContractProgress({ row, showForecast }: ContractProgressProps) {
  if (row.heureContrat == null) {
    return (
      <p className="text-sm text-muted-foreground">
        Pas d&apos;heures de contrat renseignées :{' '}
        <span className="font-medium text-foreground">{formatContractHours(row.heuresTotal)}</span>{' '}
        ce mois-ci.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {formatContractHours(row.heuresTotal)}
          </span>{' '}
          sur {formatContractHours(row.heureContrat)}
        </p>
        <span className={cn('text-sm font-bold', getPercentageClass(row.pourcentageTotal))}>
          {formatPercentage(row.pourcentageTotal)}
        </span>
      </div>
      <ContractProgressBar percentage={row.pourcentageTotal} className="h-2" />
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>
          Écart :{' '}
          <span className={cn('font-semibold', getDifferenceClass(row.differenceTotal))}>
            {formatDifference(row.differenceTotal)}
          </span>
        </span>
        {showForecast && row.pourcentagePrevisionnel != null && (
          <span className="inline-flex items-center gap-1">
            Prévu fin de mois :
            <ContractForecast row={row} joursOuvresRestantsMois={null} variant="tile" />
          </span>
        )}
      </div>
    </div>
  )
}
