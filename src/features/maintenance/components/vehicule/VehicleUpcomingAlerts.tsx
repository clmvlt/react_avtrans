import type { TypeEntretienDTO, VehiculeProchainEntretienDTO } from '@/models'
import { UpcomingAlertCard } from './UpcomingAlertCard'

type VehicleUpcomingAlertsProps = {
  upcoming: VehiculeProchainEntretienDTO | null | undefined
  canManage: boolean
  onValidate: (typeEntretien: TypeEntretienDTO | undefined) => void
}

/** Prochaines échéances du véhicule (kilométrage puis date), au-dessus de l'historique. */
export function VehicleUpcomingAlerts({
  upcoming,
  canManage,
  onValidate,
}: VehicleUpcomingAlertsProps) {
  const km = upcoming?.prochainEntretienKm
  const date = upcoming?.prochainEntretienDate
  if (!km && !date) return null

  return (
    <div className="space-y-3">
      {km && (
        <UpcomingAlertCard kind="km" alert={km} canManage={canManage} onValidate={onValidate} />
      )}
      {date && (
        <UpcomingAlertCard kind="date" alert={date} canManage={canManage} onValidate={onValidate} />
      )}
    </div>
  )
}
