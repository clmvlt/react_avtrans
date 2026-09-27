import type { ComponentProps } from 'react'
import { ChevronDown, CircleAlert, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import type { AbsenceDecompteDTO, JourDecompteDTO } from '@/models'
import { cn } from '@/lib/utils'
import {
  MOTIF_JOUR_LABELS,
  formatHeures,
  formatJourDecompte,
  formatJoursDecomptes,
} from '../lib/absenceDecompte'

type AbsenceDecompteSummaryProps = Omit<ComponentProps<'div'>, 'children'> & {
  decompte: AbsenceDecompteDTO | undefined
  isPending: boolean
  isError: boolean
  /** Ancien résultat affiché pendant le calcul du nouveau. */
  isStale?: boolean
  onRetry?: () => void
  /** Heures fixées à la main (absence enregistrée) : elles remplacent le calcul. */
  heuresForcees?: number | null
}

/** Libellé d'un jour du détail (vide pour un jour décompté normalement). */
function jourLabel(jour: JourDecompteDTO): string {
  if (jour.motif) {
    const label = MOTIF_JOUR_LABELS[jour.motif]
    return jour.ferie ? `${label} (${jour.ferie})` : label
  }
  if (jour.ferie) return `Férié (${jour.ferie}), décompté`
  return jour.fraction === 0.5 ? 'Demi-journée' : ''
}

/**
 * Décompte d'une absence (D8) : jours décomptés, heures créditées, base de calcul et détail jour
 * par jour repliable. Sert à l'aperçu des formulaires et aux dialogs de détail.
 */
export function AbsenceDecompteSummary({
  decompte,
  isPending,
  isError,
  isStale = false,
  onRetry,
  heuresForcees,
  className,
  ...props
}: AbsenceDecompteSummaryProps) {
  const boxClass = 'rounded-lg border border-border bg-muted/40 p-3 text-sm'

  if (isError && !decompte) {
    return (
      <div className={cn(boxClass, 'flex items-center gap-2', className)} {...props}>
        <CircleAlert className="size-4 shrink-0 text-destructive" />
        <span className="flex-1 text-muted-foreground">Impossible de calculer les heures</span>
        {onRetry && (
          <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="size-4" />
            Réessayer
          </Button>
        )}
      </div>
    )
  }

  if (isPending || !decompte) {
    return (
      <div className={cn(boxClass, 'space-y-2', className)} aria-busy="true" {...props}>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>
    )
  }

  const forced = heuresForcees !== null && heuresForcees !== undefined
  const heures = forced ? heuresForcees : decompte.heures
  const warning = forced
    ? null
    : !decompte.compteHeures
      ? "Ce type d'absence ne compte pas d'heures"
      : !decompte.contratRenseigne
        ? 'Heures du contrat non renseignées : aucune heure créditée'
        : null

  return (
    <Collapsible
      className={cn(boxClass, 'transition-opacity', isStale && 'opacity-60', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {formatJoursDecomptes(decompte.joursDecomptes, decompte.modeDecompte)} ·{' '}
              {formatHeures(heures)}
              {forced && <span className="font-normal text-muted-foreground"> (modifié)</span>}
            </p>
            {decompte.contratRenseigne && decompte.heuresHebdo !== null && (
              <p className="text-xs text-muted-foreground">
                Base : {formatHeures(decompte.heuresHebdo)} par semaine (contrat{' '}
                {formatHeures(decompte.heureContratMensuel)} par mois)
                {decompte.compteHeures && ` · ${formatHeures(decompte.heuresParJour)} par jour`}
              </p>
            )}
            {forced && (
              <p className="text-xs text-muted-foreground">
                Calcul automatique : {formatHeures(decompte.heuresCalculees)}
              </p>
            )}
          </div>
        </div>
        {decompte.jours.length > 0 && (
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="group shrink-0">
              Détail
              <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </CollapsibleTrigger>
        )}
      </div>

      {warning && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
          <CircleAlert className="size-3.5 shrink-0" />
          {warning}
        </p>
      )}

      <CollapsibleContent>
        <ul className="mt-3 max-h-60 divide-y divide-border overflow-y-auto rounded-md border border-border bg-background">
          {decompte.jours.map((jour) => (
            <li key={jour.date} className="flex items-center gap-3 px-3 py-1.5 text-xs">
              <span
                className={cn(
                  'w-24 shrink-0 font-medium',
                  jour.fraction > 0 ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {formatJourDecompte(jour.date)}
              </span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {jourLabel(jour)}
              </span>
              <span className="shrink-0 text-foreground tabular-nums">
                {jour.fraction > 0 ? formatHeures(jour.heures) : '—'}
              </span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
