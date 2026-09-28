import type { ReactNode } from 'react'
import { UserIdentity } from '@/components/shared/UserIdentity'
import { cn } from '@/lib/utils'
import {
  formatContractHours,
  formatDifference,
  formatPercentage,
  getDifferenceClass,
  getPercentageClass,
  type ContractForecastColumn,
  type ContractRow,
} from '../lib/contractFormat'
import { ContractCreditedHours } from './ContractCreditedHours'
import { ContractForecast } from './ContractForecast'
import { ContractProgressBar } from './ContractProgressBar'

type ContractComparisonCardProps = {
  row: ContractRow
  /** Tuile « Réalisation prévue » (D10), `null` pour un mois passé. */
  forecast: ContractForecastColumn
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

/**
 * Carte mobile : heures effectuées, créditées (D8), total, contrat, écart, réalisation et
 * réalisation prévue à la fin du mois (D10).
 */
export function ContractComparisonCard({ row, forecast }: ContractComparisonCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <UserIdentity user={row.user} showEmail={false}>
        {row.heureContrat != null ? (
          <span className="text-xs text-muted-foreground">Contrat : {row.heureContrat}h/mois</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Pas de contrat défini</span>
        )}
      </UserIdentity>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Tile label="Effectuées">
          <p className="font-bold text-violet-600 dark:text-violet-400">
            {formatContractHours(row.heuresEffectuees)}
          </p>
        </Tile>
        <Tile label="Créditées">
          <ContractCreditedHours row={row} />
        </Tile>
        <Tile label="Total">
          <p className="font-bold text-foreground">{formatContractHours(row.heuresTotal)}</p>
        </Tile>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <Tile label="Contrat">
          <p className="text-sm font-semibold text-foreground">
            {row.heureContrat != null ? formatContractHours(row.heureContrat) : '-'}
          </p>
        </Tile>
        <Tile label="Écart">
          <p className={cn('text-sm font-bold', getDifferenceClass(row.differenceTotal))}>
            {formatDifference(row.differenceTotal)}
          </p>
        </Tile>
        <Tile label="Réalisation">
          <p className={cn('text-sm font-bold', getPercentageClass(row.pourcentageTotal))}>
            {formatPercentage(row.pourcentageTotal)}
          </p>
        </Tile>
      </div>

      {forecast && (
        <div className="mt-2 text-center">
          <Tile label="Réalisation prévue en fin de mois">
            <ContractForecast
              row={row}
              joursOuvresRestantsMois={forecast.joursOuvresRestantsMois}
              variant="tile"
            />
          </Tile>
        </div>
      )}

      {row.heureContrat != null && row.heureContrat > 0 && (
        <ContractProgressBar percentage={row.pourcentageTotal} className="mt-3 h-2 w-full" />
      )}
    </div>
  )
}
