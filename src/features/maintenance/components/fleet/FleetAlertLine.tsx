import { CalendarDays, Route } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FleetAlert } from '../../lib/fleetStatus'

type FleetAlertLineProps = {
  alert: FleetAlert
  /**
   * Libellé « En retard de » (section « En retard ») ou « Dans ». Bug B-06 reproduit : dans la
   * section « En retard », **toutes** les alertes du véhicule sont dites en retard, y compris
   * celles à venir (valeur absolue du reste : +30 j → « En retard de 30 jours »).
   */
  late: boolean
}

/** Une échéance d'un véhicule du tableau de bord : nom du type, puis km ou jours restants. */
export function FleetAlertLine({ alert, late }: FleetAlertLineProps) {
  const remaining = Math.abs(alert.remaining)

  return (
    <div>
      <h4 className="text-sm font-medium text-foreground">{alert.typeEntretien?.nom}</h4>
      <p
        className={cn(
          'flex items-center gap-1.5 text-sm',
          late ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground',
        )}
      >
        {alert.type === 'KM' ? (
          <Route className="size-3.5" />
        ) : (
          <CalendarDays className="size-3.5" />
        )}
        {late ? 'En retard de ' : 'Dans '}
        <strong>
          {alert.type === 'KM' ? `${remaining.toLocaleString('fr-FR')} km` : `${remaining} jours`}
        </strong>
      </p>
    </div>
  )
}
