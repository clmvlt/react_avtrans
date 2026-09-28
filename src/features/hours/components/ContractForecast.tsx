import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  formatContractHours,
  formatDifference,
  formatJours,
  formatPercentage,
  getPercentageClass,
  type ContractRow,
} from '../lib/contractFormat'
import { ContractProgressBar } from './ContractProgressBar'

type ContractForecastProps = {
  row: ContractRow
  /** Jours ouvrés restants du mois sans les absences, pour chiffrer les jours d'absence déduits. */
  joursOuvresRestantsMois: number | null
  className?: string
}

const jours = (value: number) => `${formatJours(value)} j`

/**
 * Réalisation prévue à la fin du mois (D10) : ce qui est fait dans le mois (travail, absences et
 * fériés crédités) plus les jours ouvrés encore disponibles, vacances et fériés déduits, au rythme
 * du contrat. Pourcentage du contrat, heures prévues et jours disponibles ; détail du calcul au
 * survol ou au focus. Sans contrat : jours disponibles seulement.
 */
export function ContractForecast({
  row,
  joursOuvresRestantsMois,
  className,
}: ContractForecastProps) {
  const disponibles = row.joursOuvresRestants ?? 0
  const absents =
    joursOuvresRestantsMois != null ? Math.max(0, joursOuvresRestantsMois - disponibles) : 0

  if (row.heuresPrevisionnelles == null || row.pourcentagePrevisionnel == null) {
    return (
      <span className={cn('inline-flex flex-col items-center', className)}>
        <span className="text-sm text-muted-foreground">-</span>
        <span className="text-xs text-muted-foreground">{jours(disponibles)} dispo</span>
      </span>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex flex-col items-center gap-1 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            className,
          )}
        >
          <span
            className={cn(
              'text-sm font-bold underline decoration-dotted underline-offset-4',
              getPercentageClass(row.pourcentagePrevisionnel),
            )}
          >
            {formatPercentage(row.pourcentagePrevisionnel)}
          </span>
          <ContractProgressBar percentage={row.pourcentagePrevisionnel} className="h-1.5 w-16" />
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {formatContractHours(row.heuresPrevisionnelles)} · {jours(disponibles)} dispo
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>Fait ce mois : {formatContractHours(row.heuresTotal)} (travail et heures créditées)</p>
        <p>
          Jours disponibles : {jours(disponibles)}, aujourd&apos;hui compris
          {absents > 0 && ` (${jours(absents)} d'absence déduits)`}
        </p>
        <p>
          Reste prévu : {formatContractHours(row.heuresRestantesPrevues)} à{' '}
          {formatContractHours(row.heuresParJourContrat)} par jour
        </p>
        <p className="font-semibold">
          Fin de mois : {formatContractHours(row.heuresPrevisionnelles)}, soit{' '}
          {formatPercentage(row.pourcentagePrevisionnel)} du contrat (
          {formatDifference(row.differencePrevisionnelle)})
        </p>
        <p className="opacity-80">
          Heures déjà pointées aujourd&apos;hui déduites ; fériés et vacances approuvées ne comptent
          pas comme jours disponibles.
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
