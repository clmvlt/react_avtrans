import { useId } from 'react'
import { CalendarCheck, Clock, FileText, Users } from 'lucide-react'
import { StatCard } from '@/components/shared/StatCard'
import { formatContractHours, formatJours, type ContractTotals } from '../lib/contractFormat'

type ContractStatsGridProps = {
  totals: ContractTotals
  /** Jours ouvrés restants du mois (D10), masqués si null. */
  joursOuvresRestants: number | null
}

/**
 * Heures effectuées, heures créditées (absences + fériés, D8), heures contrat et employés avec
 * contrat. Le titre rappelle les jours ouvrés du mois et, pour le mois en cours, ceux qui restent.
 */
export function ContractStatsGrid({ totals, joursOuvresRestants }: ContractStatsGridProps) {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId} className="space-y-3">
      <h2 id={titleId} className="text-sm font-semibold text-foreground">
        Synthèse du mois
        {totals.joursOuvres != null && (
          <span className="font-normal text-muted-foreground">
            {' '}
            · {totals.joursOuvres} jours ouvrés
          </span>
        )}
        {joursOuvresRestants != null && (
          <span className="font-normal text-muted-foreground">
            {' '}
            · {formatJours(joursOuvresRestants)} restant{joursOuvresRestants > 1 ? 's' : ''}
          </span>
        )}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          iconClassName="bg-violet-500/10 text-violet-500"
          label="Heures effectuées"
          value={formatContractHours(totals.heuresEffectuees)}
        />
        <StatCard
          icon={CalendarCheck}
          iconClassName="bg-green-500/10 text-green-500"
          label="Heures créditées"
          value={formatContractHours(totals.heuresCreditees)}
        />
        <StatCard
          icon={FileText}
          iconClassName="bg-amber-500/10 text-amber-500"
          label="Heures contrat"
          value={formatContractHours(totals.heuresContrat)}
        />
        <StatCard
          icon={Users}
          iconClassName="bg-sky-500/10 text-sky-500"
          label="Employés avec contrat"
          value={`${totals.usersWithContract} / ${totals.userCount}`}
        />
      </div>
    </section>
  )
}
