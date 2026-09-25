import { CalendarDays, Clock, FileText, Users } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { formatContractHours, type ContractTotals } from '../lib/contractFormat'

type ContractStatsGridProps = {
  totals: ContractTotals
}

/** Heures effectuées, heures contrat, jours ouvrés du mois et employés avec contrat. */
export function ContractStatsGrid({ totals }: ContractStatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={Clock}
        iconClassName="bg-violet-500/10 text-violet-500"
        label="Heures effectuées"
        value={formatContractHours(totals.heuresEffectuees)}
      />
      <StatCard
        icon={FileText}
        iconClassName="bg-amber-500/10 text-amber-500"
        label="Heures contrat"
        value={formatContractHours(totals.heuresContrat)}
      />
      <StatCard
        icon={CalendarDays}
        iconClassName="bg-green-500/10 text-green-500"
        label="Jours ouvrés"
        value={totals.joursOuvres ?? '-'}
      />
      <StatCard
        icon={Users}
        iconClassName="bg-sky-500/10 text-sky-500"
        label="Avec contrat"
        value={`${totals.usersWithContract} / ${totals.userCount}`}
      />
    </div>
  )
}
