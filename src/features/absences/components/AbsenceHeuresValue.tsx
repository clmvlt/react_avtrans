import type { ComponentProps } from 'react'
import { CircleAlert, PenLine } from 'lucide-react'
import type { AbsenceDTO } from '@/models'
import { cn } from '@/lib/utils'
import {
  formatHeures,
  formatJoursDecomptes,
  getZeroHeuresReason,
  hasHeuresForcees,
} from '../lib/absenceDecompte'

type AbsenceHeuresValueProps = Omit<ComponentProps<'div'>, 'children'> & {
  absence: AbsenceDTO
  /** `stacked` : heures puis jours sur deux lignes (tableau) ; `inline` : sur une ligne (cartes). */
  layout?: 'stacked' | 'inline'
}

/**
 * Heures créditées par une absence (D8) : « 35 h » et « 6 j ouvrables », avec un repère si les
 * heures ont été fixées à la main ou si l'absence ne crédite rien (contrat absent, sans solde).
 */
export function AbsenceHeuresValue({
  absence,
  layout = 'stacked',
  className,
  ...props
}: AbsenceHeuresValueProps) {
  const forced = hasHeuresForcees(absence)
  const zeroReason = getZeroHeuresReason(absence)
  const jours = formatJoursDecomptes(absence.joursDecomptes, absence.modeDecompte)

  return (
    <div
      className={cn(
        layout === 'stacked' ? 'flex flex-col gap-0.5' : 'flex flex-wrap items-center gap-x-1.5',
        className,
      )}
      {...props}
    >
      <span className="flex items-center gap-1 font-medium text-foreground tabular-nums">
        {formatHeures(absence.heures)}
        {forced && (
          <PenLine className="size-3.5 text-muted-foreground" aria-label="Modifiées à la main">
            <title>Heures modifiées à la main</title>
          </PenLine>
        )}
        {zeroReason && (
          <CircleAlert className="size-3.5 text-warning" aria-label={zeroReason}>
            <title>{zeroReason}</title>
          </CircleAlert>
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        {layout === 'inline' && '· '}
        {jours}
      </span>
    </div>
  )
}
