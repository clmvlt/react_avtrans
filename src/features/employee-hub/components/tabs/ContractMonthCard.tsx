import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserContractComparisonQuery } from '@/features/hours/api/useUserContractComparisonQuery'
import { ContractCreditedHours } from '@/features/hours/components/ContractCreditedHours'
import {
  formatContractHours,
  formatJours,
  getCurrentMonthYear,
  shouldShowForecast,
} from '@/features/hours/lib/contractFormat'
import { useLiveElapsed } from '@/hooks/useLiveElapsed'
import { liveContractComparison } from '@/lib/liveCounter'
import { currentYearMonth, formatMonthTitle, shiftMonth } from '../../lib/monthCalendar'
import { ContractProgress } from '../ContractProgress'
import { HubCard } from '../HubCard'

type ContractMonthCardProps = {
  userUuid: string
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground tabular-nums">{children}</dd>
    </div>
  )
}

/**
 * Comparaison au contrat d'un mois au choix (comme une ligne de Heures contrat) : effectuées,
 * créditées par les absences et fériés (D8), total, contrat, jours travaillés et d'absence,
 * avancement et prévision de fin de mois (D10), en direct (D12).
 */
export function ContractMonthCard({ userUuid }: ContractMonthCardProps) {
  const [period, setPeriod] = useState(currentYearMonth)
  const query = useUserContractComparisonQuery(userUuid, period.year, period.month)
  const data = query.data
  const elapsed = useLiveElapsed(data?.receivedAt, data?.row?.enCours === true)
  const row = data?.row ? liveContractComparison(data.row, elapsed) : null
  const showForecast = row ? shouldShowForecast(period, getCurrentMonthYear(), [row]) : false

  return (
    <HubCard
      title={`Contrat · ${formatMonthTitle(period)}`}
      description="Heures du mois comparées au contrat"
      icon={Scale}
      actions={
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mois précédent"
            onClick={() => setPeriod((value) => shiftMonth(value, -1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Mois suivant"
            onClick={() => setPeriod((value) => shiftMonth(value, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </>
      }
    >
      {query.isPending ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : query.isError ? (
        <ErrorState
          error={query.error}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : !row ? (
        <p className="text-sm text-muted-foreground">Aucune donnée pour ce mois.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Tile label="Effectuées">{formatContractHours(row.heuresEffectuees)}</Tile>
            <Tile label="Créditées">
              <ContractCreditedHours row={row} />
            </Tile>
            <Tile label="Total">{formatContractHours(row.heuresTotal)}</Tile>
            <Tile label="Jours travaillés">{row.joursTravailles}</Tile>
            <Tile label="Jours d'absence">{formatJours(row.joursAbsence)}</Tile>
            <Tile label="Moyenne par jour">
              {row.moyenneHeuresParJour != null
                ? formatContractHours(row.moyenneHeuresParJour)
                : '-'}
            </Tile>
          </dl>
          <ContractProgress row={row} showForecast={showForecast} />
        </div>
      )}
    </HubCard>
  )
}
