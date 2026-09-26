import { CalendarDays, CircleCheck, Route } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ProchainEntretienDTO, TypeEntretienDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatLongDate } from '../../lib/entretienDates'

type UpcomingAlertCardProps = {
  kind: 'km' | 'date'
  alert: ProchainEntretienDTO
  /** Bouton « Valider ». */
  canManage: boolean
  onValidate: (typeEntretien: TypeEntretienDTO | undefined) => void
}

/**
 * Bandeau d'une prochaine échéance d'EntretiensVehicule.vue. Comme le Vue : rouge si l'échéance
 * est en retard, **vert sinon** (pas de palier « à venir »), et reste négatif affiché tel quel
 * (« (-500 km restants) », « (-12 jours) »).
 */
export function UpcomingAlertCard({ kind, alert, canManage, onValidate }: UpcomingAlertCardProps) {
  const late = alert.enRetard === true
  const remaining = kind === 'km' ? alert.kmRestants : alert.joursRestants

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:gap-4',
        late
          ? 'border-red-500 bg-red-50 dark:bg-red-950/30'
          : 'border-green-500 bg-green-50 dark:bg-green-950/30',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full',
            late
              ? 'bg-red-100 text-red-600 dark:bg-red-950/50'
              : 'bg-green-100 text-green-600 dark:bg-green-950/50',
          )}
        >
          {kind === 'km' ? <Route className="size-4" /> : <CalendarDays className="size-4" />}
        </span>
        <div className="flex flex-1 flex-col gap-1 md:flex-row md:flex-wrap md:items-center md:gap-3">
          <strong className="text-foreground">{alert.typeEntretien?.nom}</strong>
          <span className="text-sm text-muted-foreground">
            {kind === 'km'
              ? `à ${alert.prochainKilometrage?.toLocaleString('fr-FR') ?? ''} km`
              : `prévu le ${formatLongDate(alert.prochaineDateTemporelle)}`}
          </span>
          <span
            className={cn(
              'text-sm font-medium',
              (remaining ?? 0) < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
            )}
          >
            {kind === 'km'
              ? `(${alert.kmRestants?.toLocaleString('fr-FR') ?? ''} km restants)`
              : `(${alert.joursRestants ?? ''} jours)`}
          </span>
        </div>
        {late && (
          <Badge variant="destructive" className="shrink-0 md:hidden">
            EN RETARD
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {late && (
          <Badge variant="destructive" className="hidden md:flex">
            EN RETARD
          </Badge>
        )}
        {canManage && (
          <Button
            type="button"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onValidate(alert.typeEntretien)}
          >
            <CircleCheck className="size-3.5" />
            Valider
          </Button>
        )}
      </div>
    </div>
  )
}
