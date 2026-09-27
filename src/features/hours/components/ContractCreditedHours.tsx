import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatContractHours, type ContractRow } from '../lib/contractFormat'

type ContractCreditedHoursProps = {
  row: ContractRow
  className?: string
}

/**
 * Heures créditées d'un employé sur le mois (D8), avec le détail absences / jours fériés au
 * survol ou au focus.
 */
export function ContractCreditedHours({ row, className }: ContractCreditedHoursProps) {
  const joursFeries = row.joursFeries ?? 0
  const muted = row.heuresCreditees <= 0

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-sm font-semibold underline decoration-dotted underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            muted ? 'font-normal text-muted-foreground' : 'text-foreground',
            className,
          )}
        >
          {formatContractHours(row.heuresCreditees)}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          Absences : {formatContractHours(row.heuresAbsences ?? 0)} ({row.joursAbsence} j lun.-ven.)
        </p>
        <p>
          Jours fériés : {formatContractHours(row.heuresFeries ?? 0)} ({joursFeries} jour
          {joursFeries > 1 ? 's' : ''})
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
