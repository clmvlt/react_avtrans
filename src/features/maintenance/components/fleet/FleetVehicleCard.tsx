import { CircleCheck, Clock, List, TriangleAlert, Truck } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { FleetVehicleStatus } from '../../lib/fleetStatus'
import { FleetAlertLine } from './FleetAlertLine'

export type FleetSectionVariant = 'late' | 'upcoming' | 'ok'

const ENTRETIENS_BUTTON: Record<
  FleetSectionVariant,
  { variant: 'destructive' | 'outline'; className?: string }
> = {
  late: { variant: 'destructive' },
  upcoming: {
    variant: 'outline',
    className:
      'border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30',
  },
  ok: {
    variant: 'outline',
    className:
      'border-green-500/50 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30',
  },
}

type FleetVehicleCardProps = {
  item: FleetVehicleStatus
  variant: FleetSectionVariant
}

/** Carte d'un véhicule du tableau de bord : échéances et liens vers le véhicule et ses entretiens. */
export function FleetVehicleCard({ item, variant }: FleetVehicleCardProps) {
  const { vehicule, alerts } = item
  const entretiensButton = ENTRETIENS_BUTTON[variant]

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="font-medium text-foreground">
            {vehicule.brand} {vehicule.model}
          </span>
          <span className="ml-2 text-sm whitespace-nowrap text-muted-foreground">
            {vehicule.immat}
          </span>
        </div>
        {variant === 'late' && <TriangleAlert className="size-5 text-red-500" />}
        {variant === 'upcoming' && <Clock className="size-5 text-amber-500" />}
        {variant === 'ok' && <CircleCheck className="size-5 text-green-500" />}
      </div>

      <div className="space-y-2">
        {variant === 'ok' && alerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun entretien à prévoir</p>
        ) : (
          alerts.map((alert, index) => (
            <FleetAlertLine key={index} alert={alert} late={variant === 'late'} />
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/vehicules/${vehicule.id}`}>
            <Truck className="size-4" />
            Voir le véhicule
          </Link>
        </Button>
        <Button
          variant={entretiensButton.variant}
          size="sm"
          className={entretiensButton.className}
          asChild
        >
          <Link to={`/entretiens/vehicule/${vehicule.id}`}>
            <List className="size-4" />
            Entretiens
          </Link>
        </Button>
      </div>
    </div>
  )
}
