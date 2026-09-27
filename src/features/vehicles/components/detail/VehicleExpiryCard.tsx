import type { LucideIcon } from 'lucide-react'
import { EXPIRY_LABEL, EXPIRY_TEXT_CLASS, getExpiryStatus } from '../../lib/expiryStatus'
import { formatDateShort } from '../../lib/formatters'
import { VehicleFactCard } from './VehicleFactCard'

type VehicleExpiryCardProps = {
  icon: LucideIcon
  label: string
  /** Échéance `YYYY-MM-DD` (contrôle technique, assurance). */
  date: string | undefined
  /** Précision affichée quand l'échéance est lointaine (« Prochain contrôle »…). */
  hint: string
}

/**
 * Carte d'une échéance du véhicule : date en orange sous 30 jours, en rouge une fois passée, avec
 * l'état écrit en toutes lettres ; « Non renseignée » sans date.
 */
export function VehicleExpiryCard({ icon, label, date, hint }: VehicleExpiryCardProps) {
  if (!date) {
    return (
      <VehicleFactCard
        icon={icon}
        label={label}
        value="Non renseignée"
        valueClassName="text-base font-medium text-muted-foreground"
      />
    )
  }

  const status = getExpiryStatus(date)

  return (
    <VehicleFactCard
      icon={icon}
      label={label}
      value={formatDateShort(date)}
      valueClassName={EXPIRY_TEXT_CLASS[status]}
      hint={EXPIRY_LABEL[status] ?? hint}
      hintClassName={status === 'ok' ? undefined : EXPIRY_TEXT_CLASS[status]}
    />
  )
}
