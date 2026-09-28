import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { VehiculeRelaiDTO } from '@/models'
import type { RelaiActions } from '../../../hooks/useRelaiDialogs'
import { formatNumber } from '../../../lib/formatters'
import { RELAI_STATUT_LABELS, describeRelaiVehicle, formatRelaiPeriode } from '../../../lib/relais'
import { RelaiActionsMenu } from '../../relais/RelaiActionsMenu'

type RelaiHistoryItemProps = {
  relai: VehiculeRelaiDTO
  canManage: boolean
  actions: RelaiActions
}

const STATUT_BADGE: Record<VehiculeRelaiDTO['statut'], string> = {
  EN_COURS: 'bg-primary/10 text-primary',
  A_VENIR: 'bg-info/10 text-info',
  TERMINE: 'bg-muted text-muted-foreground',
}

const km = (value: number | null | undefined) => (value != null ? `${formatNumber(value)} km` : '?')

/** Un relais de l'historique : plaque, statut, période, motif, kilométrage et relevés. */
export function RelaiHistoryItem({ relai, canManage, actions }: RelaiHistoryItemProps) {
  const model = describeRelaiVehicle(relai)
  const kmArrivee = relai.kmFin ?? relai.latestKm
  const hasKm = relai.kmDebut != null || kmArrivee != null

  return (
    <li
      className={cn(
        'rounded-xl border bg-card p-4',
        relai.statut === 'EN_COURS' && 'border-primary/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold tracking-wide text-foreground uppercase">
              {relai.immat}
            </span>
            {model && <span className="text-sm text-muted-foreground">{model}</span>}
            <Badge className={STATUT_BADGE[relai.statut]}>
              {RELAI_STATUT_LABELS[relai.statut]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground first-letter:uppercase">
            {formatRelaiPeriode(relai)}
            {relai.motif && ` · ${relai.motif}`}
          </p>
        </div>
        {canManage && <RelaiActionsMenu relai={relai} actions={actions} />}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        {hasKm && (
          <span className="inline-flex items-center gap-1.5 text-foreground">
            {km(relai.kmDebut)}
            <ArrowRight className="size-3.5 text-muted-foreground" />
            {km(kmArrivee)}
            {relai.kmFin == null && relai.latestKm != null && (
              <span className="text-xs text-muted-foreground">(dernier relevé)</span>
            )}
          </span>
        )}
        {relai.kmParcourus != null && (
          <span className="font-medium text-foreground">
            {formatNumber(relai.kmParcourus)} km parcourus
          </span>
        )}
        <span className="text-muted-foreground">
          {relai.nbReleves} relevé{relai.nbReleves > 1 ? 's' : ''}
        </span>
      </div>

      {relai.commentaire && (
        <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
          {relai.commentaire}
        </p>
      )}
    </li>
  )
}
