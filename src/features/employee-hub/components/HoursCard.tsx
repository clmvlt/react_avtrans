import { ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserContractComparisonQuery } from '@/features/hours/api/useUserContractComparisonQuery'
import { useUserWorkedHoursQuery } from '@/features/user-services/api/useUserWorkedHoursQuery'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { isPeriodRunning, liveContractComparison, livePeriodSeconds } from '@/lib/liveCounter'
import { formatDayHours } from '../lib/formatters'
import { currentYearMonth, formatMonthTitle } from '../lib/monthCalendar'
import { ContractProgress } from './ContractProgress'
import { HubCard } from './HubCard'

/** Même clé que la carte « Aujourd'hui » et les pointages d'un employé. */
const ALL_HOURS_PARAMS = {}

const PERIODS: { key: 'week' | 'month' | 'lastMonth' | 'year'; label: string }[] = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'lastMonth', label: 'Mois dernier' },
  { key: 'year', label: 'Année' },
]

type HoursCardProps = {
  userUuid: string
  /** « Détail » : ouvre l'onglet des heures */
  onShowHours: () => void
}

/**
 * Heures nettes de l'employé (semaine, mois, mois dernier, année) et avancement du mois en cours
 * par rapport à son contrat. Tout vient de l'API et avance en direct (D12).
 */
export function HoursCard({ userUuid, onShowHours }: HoursCardProps) {
  const current = currentYearMonth()
  const hoursQuery = useUserWorkedHoursQuery(userUuid, ALL_HOURS_PARAMS)
  const contractQuery = useUserContractComparisonQuery(userUuid, current.year, current.month)

  const hours = hoursQuery.data?.data
  const running = PERIODS.some(({ key }) => isPeriodRunning(hours?.[key]))
  const elapsed = useLiveElapsed(hoursQuery.data?.receivedAt, running)

  const contract = contractQuery.data
  const contractElapsed = useLiveElapsed(contract?.receivedAt, contract?.row?.enCours === true)
  const row = contract?.row ? liveContractComparison(contract.row, contractElapsed) : null

  return (
    <HubCard
      title="Heures"
      description="Temps de travail net, pauses déduites"
      icon={Clock}
      actions={
        <Button variant="ghost" size="sm" onClick={onShowHours}>
          Détail
          <ChevronRight className="size-4" />
        </Button>
      }
    >
      <dl className="grid grid-cols-2 gap-2">
        {PERIODS.map(({ key, label }) => (
          <div key={key} className="rounded-lg bg-muted/50 px-3 py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-mono text-lg font-semibold text-foreground tabular-nums">
              {hoursQuery.isPending ? (
                <Skeleton className="my-1 h-5 w-14" />
              ) : (
                formatDayHours(livePeriodSeconds(hours?.[key], elapsed)) || '0h'
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t pt-3">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Contrat · {formatMonthTitle(current)}
        </p>
        {contractQuery.isPending ? (
          <Skeleton className="h-14 w-full" />
        ) : row ? (
          <ContractProgress row={row} showForecast />
        ) : (
          <p className="text-sm text-muted-foreground">Comparaison au contrat indisponible.</p>
        )}
      </div>
    </HubCard>
  )
}
