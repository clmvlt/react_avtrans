import { Clock } from 'lucide-react'
import { UserHoursContent } from '@/features/users/components/hours/UserHoursContent'
import { HubCard } from '../HubCard'
import { ContractMonthCard } from './ContractMonthCard'

type HoursTabProps = {
  userUuid: string
}

/**
 * Heures de l'employé : par période au choix (comme le dialog « Heures » des Utilisateurs) et
 * comparées à son contrat mois par mois. Côte à côte sur très grand écran.
 */
export function HoursTab({ userUuid }: HoursTabProps) {
  return (
    <div className="grid items-start gap-4 sm:gap-6 3xl:grid-cols-2">
      <HubCard
        title="Heures travaillées"
        description="Par jour, semaine, mois ou année"
        icon={Clock}
        bodyClassName="flex flex-col gap-4"
      >
        <UserHoursContent userUuid={userUuid} />
      </HubCard>
      <ContractMonthCard userUuid={userUuid} />
    </div>
  )
}
